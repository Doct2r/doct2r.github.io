import type cytoscape from 'cytoscape';
import type { GraphData } from './graph-types';

function isActiveAt(range: { start?: number; end?: number }, year: number): boolean {
  if (range.start === undefined) return true; // 시간 정보 없으면 항상 표시
  const start = range.start;
  const end = range.end ?? range.start;
  return start <= year && year <= end;
}

/** 데이터에 담긴 노드들의 start/end 전체 범위를 구한다. 시간 정보가 있는 노드가 하나도 없으면 null. */
export function getTimeRange(data: GraphData): { min: number; max: number } | null {
  const years = data.nodes.flatMap((n) => (n.start === undefined ? [] : [n.start, n.end ?? n.start]));
  if (years.length === 0) return null;
  return { min: Math.min(...years), max: Math.max(...years) };
}

export interface TimelineScale {
  /** 실제 연도 → 시간 바 위 0~100 퍼센트 위치 */
  toPercent(year: number): number;
  /** 시간 바 위 0~100 퍼센트 위치 → 실제 연도 */
  toYear(percent: number): number;
}

const DEFAULT_CAP_YEARS = 120;
const DEFAULT_GAP_SHRINK = 0.05;

/**
 * 선형 축은 태초~노아처럼 사건이 거의 없는 수천 년짜리 공백을 실제 길이 그대로 잡아먹어서,
 * 정작 인물·사건이 몰린 구간(왕국시대~신약)이 바의 한쪽 구석에 짓눌린다. 그렇다고 로그축처럼
 * 한쪽 끝(예: 데이터의 최신 연도)을 기준으로 전체를 압축하면, 이번엔 그 기준점 근처의 다른
 * 공백(예: 신약 이후~로마제국 멸망까지)이 오히려 늘어나 버린다.
 * 그래서 "실제로 비어 있는 구간만" 눌러 담는 구간별(piecewise) 스케일을 쓴다: 연속된 두
 * breakpoint 사이의 간격이 cap년 이하면 실제 길이 그대로, cap을 넘는 만큼은 shrink 비율로만
 * 화면 폭에 반영한다. breakpoints는 그래프의 모든 노드·엣지 start/end, 집필 시기 구간,
 * 구약/신약 전환점(0년)을 모아 만든다 — 이 값들이 곧 "실제로 뭔가 있는 지점"이기 때문이다.
 */
export function buildTimelineScale(
  years: number[],
  opts: { cap?: number; shrink?: number } = {},
): TimelineScale {
  const cap = opts.cap ?? DEFAULT_CAP_YEARS;
  const shrink = opts.shrink ?? DEFAULT_GAP_SHRINK;
  const sorted = Array.from(new Set(years)).sort((a, b) => a - b);

  if (sorted.length < 2) {
    const only = sorted[0] ?? 0;
    return { toPercent: () => 0, toYear: () => only };
  }

  function segmentWidth(gap: number): number {
    return gap <= cap ? gap : cap + (gap - cap) * shrink;
  }

  const cum: number[] = [0];
  for (let i = 1; i < sorted.length; i++) {
    cum.push(cum[i - 1] + segmentWidth(sorted[i] - sorted[i - 1]));
  }
  const total = cum[cum.length - 1] || 1;

  function findSegment(value: number, arr: number[]): number {
    let i = 0;
    while (i < arr.length - 2 && arr[i + 1] < value) i++;
    return i;
  }

  function toPercent(year: number): number {
    if (year <= sorted[0]) return 0;
    if (year >= sorted[sorted.length - 1]) return 100;
    const i = findSegment(year, sorted);
    const gap = sorted[i + 1] - sorted[i];
    const frac = gap === 0 ? 0 : (year - sorted[i]) / gap;
    return ((cum[i] + frac * segmentWidth(gap)) / total) * 100;
  }

  function toYear(percent: number): number {
    const pos = (percent / 100) * total;
    if (pos <= 0) return sorted[0];
    if (pos >= total) return sorted[sorted.length - 1];
    const i = findSegment(pos, cum);
    const gap = sorted[i + 1] - sorted[i];
    const width = segmentWidth(gap);
    const frac = width === 0 ? 0 : (pos - cum[i]) / width;
    return sorted[i] + frac * gap;
  }

  return { toPercent, toYear };
}

/** 그래프 데이터(+선택적으로 다른 연도 목록)에서 스케일을 만들 breakpoint 연도들을 모은다. */
export function collectYearBreakpoints(data: GraphData, extra: number[] = []): number[] {
  const fromNodes = data.nodes.flatMap((n) => (n.start === undefined ? [] : [n.start, n.end ?? n.start]));
  const fromEdges = data.edges.flatMap((e) => (e.start === undefined ? [] : [e.start, e.end ?? e.start]));
  return [...fromNodes, ...fromEdges, ...extra];
}

/**
 * 선택한 연도 기준으로 노드/엣지의 표시 여부를 갱신한다.
 * 레이아웃(위치)은 건드리지 않고 display만 바꿔서(비활성 = 완전히 사라짐), 슬라이더를
 * 움직이면 그 시점에 없던 인물·집단·지역·관계는 흐려지는 게 아니라 아예 안 보이게 한다.
 * 엣지는 (1) 양쪽 끝 노드가 둘 다 살아있고, (2) 엣지 자신에게 start/end가 있다면 그
 * 기간에도 들어와야 보인다 — 같은 두 노드 사이라도 시기별로 성격이 다른 관계를
 * 엣지를 여러 개 둬서 표현할 수 있게 하기 위함이다(예: 로마-유대의 "봉신국"→"직할 속주").
 *
 * 데이터셋 전체(50여 개 노드)에 맞춰 한 번만 잡아둔 화면은, 특정 시점에 한둘만 활성일 때
 * 그 노드가 화면 한구석에 점 하나로 묻혀 "아무것도 안 보이는" 것처럼 보이게 만든다.
 * 그래서 필터를 적용할 때마다 지금 활성인 요소만 다시 화면에 꽉 차게 맞춘다(fit).
 */
export function applyTimeFilter(cy: cytoscape.Core, data: GraphData, year: number): void {
  const activeIds = new Set(data.nodes.filter((n) => isActiveAt(n, year)).map((n) => n.id));

  cy.batch(() => {
    cy.nodes().forEach((ele) => {
      const active = activeIds.has(ele.id());
      ele.style({ display: active ? 'element' : 'none' });
    });
    cy.edges().forEach((ele) => {
      const nodesActive = activeIds.has(ele.data('source')) && activeIds.has(ele.data('target'));
      const ownWindowActive = isActiveAt({ start: ele.data('start'), end: ele.data('end') }, year);
      const active = nodesActive && ownWindowActive;
      ele.style({ display: active ? 'element' : 'none' });
    });
  });

  const visible = cy.nodes(':visible');
  if (visible.length > 0) {
    cy.fit(visible, 60);
  }
}

/** 연도를 "기원전 N년"/"기원후 N년" 형식으로 표시한다. */
export function formatYear(year: number): string {
  const y = Math.round(year);
  return y < 0 ? `기원전 ${Math.abs(y)}년` : `기원후 ${y}년`;
}
