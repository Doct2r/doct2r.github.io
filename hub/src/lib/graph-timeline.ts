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

/** 연도를 [min, max] 범위 안에서의 0~100 퍼센트 위치로 바꾼다. 시간 바 위에 특정 시점을 표시할 때 쓴다. */
export function yearToPercent(year: number, range: { min: number; max: number }): number {
  if (range.max === range.min) return 0;
  return ((year - range.min) / (range.max - range.min)) * 100;
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
