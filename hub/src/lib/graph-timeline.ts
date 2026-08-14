import type cytoscape from 'cytoscape';
import type { GraphData, GraphNode } from './graph-types';

const HIDDEN_OPACITY = 0.08;

function isActiveAt(node: GraphNode, year: number): boolean {
  if (node.start === undefined) return true; // 시간 정보 없는 노드는 항상 표시
  const start = node.start;
  const end = node.end ?? node.start;
  return start <= year && year <= end;
}

/** 데이터에 담긴 노드들의 start/end 전체 범위를 구한다. 시간 정보가 있는 노드가 하나도 없으면 null. */
export function getTimeRange(data: GraphData): { min: number; max: number } | null {
  const years = data.nodes.flatMap((n) => (n.start === undefined ? [] : [n.start, n.end ?? n.start]));
  if (years.length === 0) return null;
  return { min: Math.min(...years), max: Math.max(...years) };
}

/**
 * 선택한 연도 기준으로 노드/엣지의 표시 여부를 갱신한다.
 * 레이아웃(위치)은 건드리지 않고 투명도·클릭 가능 여부만 바꿔서, 슬라이더를 움직여도
 * 그래프가 들썩이지 않고 매끈하게 나타났다 사라지게 한다.
 * 엣지는 양쪽 끝 노드가 둘 다 살아있을 때만 보인다.
 */
export function applyTimeFilter(cy: cytoscape.Core, data: GraphData, year: number): void {
  const activeIds = new Set(data.nodes.filter((n) => isActiveAt(n, year)).map((n) => n.id));

  cy.batch(() => {
    cy.nodes().forEach((ele) => {
      const active = activeIds.has(ele.id());
      ele.style({ opacity: active ? 1 : HIDDEN_OPACITY, events: active ? 'yes' : 'no' });
    });
    cy.edges().forEach((ele) => {
      const active = activeIds.has(ele.data('source')) && activeIds.has(ele.data('target'));
      ele.style({ opacity: active ? 1 : HIDDEN_OPACITY, events: active ? 'yes' : 'no' });
    });
  });
}

/** 연도를 "기원전 N년"/"기원후 N년" 형식으로 표시한다. */
export function formatYear(year: number): string {
  const y = Math.round(year);
  return y < 0 ? `기원전 ${Math.abs(y)}년` : `기원후 ${y}년`;
}
