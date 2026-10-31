// Hand-written TypeScript mirrors of schema/*.json.
// LEARNING NOTE: these can drift from the schemas. Roadmap M9 replaces them with
// types generated from the schema (json-schema-to-typescript) so there is one source of truth.

export type NodeType = 'start' | 'end' | 'process' | 'error' | 'success' | 'screen' | 'decision' | 'note';
export type EdgeKind = 'normal' | 'success' | 'error' | 'note';
export type Side = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
export type Place = 'right' | 'below' | 'below-right' | 'above' | 'above-right';

export interface Phase { id: string; title: string }

export interface FlowNode {
  id: string;
  type: NodeType;
  phase: string;
  label?: string;
  tag?: string;
  title?: string;
  description?: string;
  text?: string;
  attach?: string;
  hint?: { col: number; row: number };
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  kind?: EdgeKind;
  loop?: boolean;
  place?: Place;
  fromSide?: Side;
  toSide?: Side;
}

/** Authoring contract: what is in the flow. No coordinates. */
export interface FlowSpec {
  schemaVersion: '1';
  name: string;
  phases: Phase[];
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface Point { x: number; y: number }

export interface PlanNode {
  id: string;
  type: NodeType;
  x: number; y: number; width: number; height: number;
  props: { label?: string; tag?: string; title?: string; description?: string; text?: string };
}

export interface PlanEdge {
  id: string;
  from: string; to: string;
  fromSide: Side; toSide: Side;
  kind: EdgeKind;
  label?: string;
  route?: Point[];
}

export interface PlanPhase { id: string; title: string; x: number; y: number; width: number; height: number }

/** Plugin contract: everything decided, absolute coordinates. */
export interface RenderPlan {
  schemaVersion: '1';
  name: string;
  connectorMode: 'native' | 'vector';
  frame: { width: number; height: number };
  phases: PlanPhase[];
  nodes: PlanNode[];
  edges: PlanEdge[];
}

export interface Issue { level: 'error' | 'warning'; path: string; message: string }
