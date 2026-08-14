// 관계도 그래프 공용 데이터 타입.
// type을 특정 도메인(블로그의 person/company 등)에 고정하지 않고 string으로 열어둬서,
// 성경 관계도(figure/kingdom/place 등) 같은 전혀 다른 타입 집합도 같은 인터페이스로 다룰 수 있게 한다.

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  /** 등장 연도(선택). 기원전은 음수(예: 기원전 586년 = -586). 없으면 항상 표시된다. */
  start?: number;
  /** 퇴장 연도(선택). start만 있고 end가 없으면 start와 같은 것으로 취급한다. */
  end?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  /**
   * 이 관계선만의 유효 기간(선택). 두 노드가 둘 다 살아있는 기간이라도, 관계의 성격이
   * 시기에 따라 바뀌는 경우(예: 봉신국 → 직할 속주) 같은 두 노드 사이에 start/end가 다른
   * 엣지를 여러 개 두는 식으로 표현한다. 없으면 두 노드가 둘 다 활성인 동안 항상 표시된다.
   */
  start?: number;
  end?: number;
  /** 관계의 성격(선택, 자유 문자열: 예 "우호"/"적대"/"복속" 등). 엣지 색 구분에 쓸 수 있다. */
  kind?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
