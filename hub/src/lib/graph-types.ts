// 관계도 그래프 공용 데이터 타입.
// type을 특정 도메인(블로그의 person/company 등)에 고정하지 않고 string으로 열어둬서,
// 성경 관계도(figure/kingdom/place 등) 같은 전혀 다른 타입 집합도 같은 인터페이스로 다룰 수 있게 한다.

export interface GraphNode {
  id: string;
  label: string;
  type: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
