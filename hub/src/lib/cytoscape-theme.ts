import cytoscape from 'cytoscape';
import type { GraphData } from './graph-types';

export interface ThemedGraphOptions {
  /** 노드의 type 값(예: "person") → 색을 읽어올 CSS 변수 이름(예: "--hub-graph-person") */
  typeColorVar: Record<string, string>;
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

function buildStyle(opts: Required<Omit<ThemedGraphOptions, 'typeColorVar'>> & { typeColorVar: Record<string, string> }): cytoscape.StylesheetJson {
  const edge = readVar(opts.edgeColorVar);
  const label = readVar(opts.labelColorVar);
  const edgeLabelBg = readVar(opts.edgeLabelBgVar);

  const nodeStyles: cytoscape.StylesheetJson = Object.entries(opts.typeColorVar).map(([type, colorVar]) => ({
    selector: `node[type="${type}"]`,
    style: {
      'background-color': readVar(colorVar),
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
  typeColorVar: Record<string, string>,
  opts: Partial<Omit<ThemedGraphOptions, 'typeColorVar'>> = {},
): cytoscape.Core {
  const resolved = {
    typeColorVar,
    edgeColorVar: opts.edgeColorVar ?? DEFAULTS.edgeColorVar,
    labelColorVar: opts.labelColorVar ?? DEFAULTS.labelColorVar,
    edgeLabelBgVar: opts.edgeLabelBgVar ?? DEFAULTS.edgeLabelBgVar,
    layout: opts.layout ?? DEFAULTS.layout,
  };

  const elements: cytoscape.ElementDefinition[] = [
    ...data.nodes.map((n) => ({ data: { id: n.id, label: n.label, type: n.type } })),
    ...data.edges.map((e) => ({ data: { source: e.source, target: e.target, label: e.label } })),
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
