import cytoscape from 'cytoscape';
import type { GraphData } from './graph-types';

export interface TypeStyle {
  /** 이 type의 색을 읽어올 CSS 변수 이름(예: "--hub-graph-person") */
  colorVar: string;
  /** 기본값 'ellipse'. 색만으로는 구분이 약한 타입(집단/지역 등)을 도형으로도 구별한다. */
  shape?: cytoscape.Css.NodeShape;
}

export interface ThemedGraphOptions {
  /** 노드의 type 값(예: "person") → 스타일(색·도형) */
  typeStyle: Record<string, TypeStyle>;
  /** 기본값: --hub-graph-edge */
  edgeColorVar?: string;
  /** 기본값: --hub-graph-label (노드·엣지 라벨 공통) */
  labelColorVar?: string;
  /** 기본값: --hub-graph-edge-label-bg */
  edgeLabelBgVar?: string;
  layout?: cytoscape.LayoutOptions;
}

const DEFAULTS = {
  edgeColorVar: '--hub-graph-edge',
  labelColorVar: '--hub-graph-label',
  edgeLabelBgVar: '--hub-graph-edge-label-bg',
  layout: { name: 'cose', animate: false, padding: 40 } as cytoscape.LayoutOptions,
};

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function buildStyle(opts: Required<Omit<ThemedGraphOptions, 'typeStyle'>> & { typeStyle: Record<string, TypeStyle> }): cytoscape.StylesheetJson {
  const edge = readVar(opts.edgeColorVar);
  const label = readVar(opts.labelColorVar);
  const edgeLabelBg = readVar(opts.edgeLabelBgVar);

  const nodeStyles: cytoscape.StylesheetJson = Object.entries(opts.typeStyle).map(([type, style]) => ({
    selector: `node[type="${type}"]`,
    style: {
      'background-color': readVar(style.colorVar),
      shape: style.shape ?? 'ellipse',
      label: 'data(label)',
      color: label,
      'font-size': '12px',
      'text-valign': 'bottom',
      'text-margin-y': 6,
    },
  }));

  return [
    ...nodeStyles,
    {
      // 다른 노드가 parent로 지정한 노드는 자식들을 감싸는 컨테이너로도 그려진다(compound node).
      // 자기 type 색은 유지하되, 안은 비치게 하고 점선 테두리를 둘러 "그룹" 느낌을 낸다.
      selector: ':parent',
      style: {
        'background-opacity': 0.2,
        'border-width': 2,
        'border-style': 'dashed',
        'border-color': edge,
        'border-opacity': 0.9,
        padding: '18px',
        'text-valign': 'top',
        'text-margin-y': -6,
        'font-size': '11px',
        'font-weight': 600,
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': edge,
        'target-arrow-color': edge,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': '10px',
        color: label,
        'text-background-color': edgeLabelBg,
        'text-background-opacity': 0.85,
        'text-background-padding': '2px',
      },
    },
  ];
}

/**
 * CSS 변수(테마 토큰)를 읽어 색을 입힌 Cytoscape 그래프를 만든다.
 * Cytoscape는 캔버스에 직접 그리므로 var(--x)를 이해하지 못해, 매번 실제 계산된
 * 색상값을 읽어 스타일을 새로 구성해야 한다. 토글로 테마가 바뀌면(같은 페이지 안이든
 * storage 이벤트로 다른 탭에서 반영되든) window의 "theme-change" 이벤트를 받아
 * 다시 칠한다. 반환된 cy 인스턴스를 계속 들고 있으면, 나중에 시간 바 같은 기능이
 * cy.elements()를 필터링하는 식으로 이 위에 얹을 수 있다.
 */
export function createThemedGraph(
  container: HTMLElement,
  data: GraphData,
  typeStyle: Record<string, TypeStyle>,
  opts: Partial<Omit<ThemedGraphOptions, 'typeStyle'>> = {},
): cytoscape.Core {
  const resolved = {
    typeStyle,
    edgeColorVar: opts.edgeColorVar ?? DEFAULTS.edgeColorVar,
    labelColorVar: opts.labelColorVar ?? DEFAULTS.labelColorVar,
    edgeLabelBgVar: opts.edgeLabelBgVar ?? DEFAULTS.edgeLabelBgVar,
    layout: opts.layout ?? DEFAULTS.layout,
  };

  const elements: cytoscape.ElementDefinition[] = [
    ...data.nodes.map((n) => ({ data: { id: n.id, label: n.label, type: n.type, parent: n.parent } })),
    // start/end를 엣지 data에도 실어 둬서, 시간 바가 엣지 자신의 유효기간을 즉시 읽을 수 있게 한다
    // (같은 두 노드 사이라도 시기별로 다른 엣지를 두면 관계의 성격이 바뀌는 걸 표현할 수 있다).
    ...data.edges.map((e) => ({
      data: { source: e.source, target: e.target, label: e.label, start: e.start, end: e.end, kind: e.kind },
    })),
  ];

  const cy = cytoscape({
    container,
    elements,
    style: buildStyle(resolved),
    layout: resolved.layout,
  });

  window.addEventListener('theme-change', () => {
    cy.style(buildStyle(resolved));
  });

  return cy;
}
