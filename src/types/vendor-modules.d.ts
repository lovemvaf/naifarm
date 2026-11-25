declare module "livekit-server-sdk" {
  export class TwirpError extends Error {
    status: number;
    code: string;
  }
  export const ParticipantInfo_State: { readonly ACTIVE: number };
  export const TrackSource: { readonly CAMERA: number; readonly MICROPHONE: number };
  export const WebhookReceiver: new (key: string, secret: string) => {
    receive(raw: string, auth: string | null): Promise<{ id?: string; room?: { name?: string }; event: string }>;
  };
  export const RoomServiceClient: new (url: string, key: string, secret: string, options?: unknown) => {
    listParticipants(room: string): Promise<ParticipantInfo[]>;
    listRooms(rooms: string[]): Promise<Room[]>;
    removeParticipant(room: string, identity: string, options?: unknown): Promise<unknown>;
    createRoom(options: unknown): Promise<unknown>;
    deleteRoom(room: string): Promise<unknown>;
  };
  export const AccessToken: new (key: unknown, secret: unknown, options?: unknown) => {
    addGrant(grant: unknown): unknown;
    toJwt(): string;
  };
  export type ParticipantInfo = { identity: string; state: number; tracks: TrackInfo[] };
  export type TrackInfo = { source: number; muted: boolean };
  export type Room = { name: string };
}

declare module "livekit-client" {
  export const ConnectionQuality: { readonly Unknown: string; readonly Excellent: string; readonly Good: string; readonly Poor: string; readonly Lost: string };
  export type ConnectionQuality = string;
  export type Participant = { identity: string };
  export type RemoteParticipant = {
    identity: string;
    videoTrackPublications: Map<string, RemoteTrackPublication>;
    trackPublications: Map<string, RemoteTrackPublication>;
  };
  export type RemoteTrack = { attach(element: unknown): unknown; detach(): unknown };
  export type RemoteTrackPublication = {
    source: Track.Source;
    isMuted: boolean;
    isDesired: boolean;
    setSubscribed(desired: boolean): unknown;
    track?: RemoteTrack;
  };
  export type LocalParticipant = {
    identity: string;
    connectionQuality: string;
    setCameraEnabled(enabled: boolean): Promise<{ track?: RemoteTrack } | undefined>;
    setMicrophoneEnabled(enabled: boolean): Promise<unknown>;
    publishTrack(track: unknown, options?: unknown): Promise<unknown>;
  };
  export type LocalVideoTrack = {
    attach(element: unknown): unknown;
    stop(): unknown;
    restartTrack(options: unknown): Promise<unknown>;
  };
  export type Room = {
    remoteParticipants: Map<string, RemoteParticipant>;
    localParticipant: LocalParticipant;
    canPlaybackAudio: boolean;
    connect(...args: unknown[]): Promise<unknown>;
    disconnect(): Promise<unknown>;
    startAudio(): Promise<unknown>;
    on(event: unknown, listener: (...args: never[]) => void): unknown;
  };
  export const Room: new (...args: unknown[]) => Room;
  export const RoomEvent: {
    readonly ConnectionQualityChanged: string;
    readonly TrackSubscribed: string;
    readonly TrackUnsubscribed: string;
    readonly TrackPublished: string;
    readonly TrackUnpublished: string;
    readonly TrackMuted: string;
    readonly TrackUnmuted: string;
    readonly ParticipantConnected: string;
    readonly ParticipantActive: string;
    readonly ParticipantDisconnected: string;
    readonly AudioPlaybackStatusChanged: string;
    readonly Reconnecting: string;
    readonly Reconnected: string;
    readonly Disconnected: string;
  };
  export namespace Track {
    export enum Source { Camera = "camera", Microphone = "microphone" }
  }
  export const VideoPresets: { readonly h720: { readonly resolution: { width: number; height: number } } };
  export function createLocalVideoTrack(...args: unknown[]): Promise<LocalVideoTrack>;
  export function createLocalAudioTrack(...args: unknown[]): Promise<{ stop(): unknown }>;
  export function createAudioAnalyser(track: unknown, options?: unknown): {
    calculateVolume(): number;
    cleanup(): Promise<unknown>;
    analyser: { context: unknown };
  };
}

declare module "@google/genai" {
  export const GoogleGenAI: new (options: unknown) => {
    models: {
      embedContent(params: unknown): Promise<{ embeddings?: ContentEmbedding[] }>;
      generateContent(params: unknown): Promise<{ text?: string }>;
    };
  };
  export type ContentEmbedding = { values?: number[] };
}

declare module "mammoth" {
  const mammoth: { extractRawText(options: unknown): Promise<{ value: string }> };
  export default mammoth;
}

declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export function getDocument(params: unknown): {
    promise: Promise<{
      numPages: number;
      getPage(page: number): Promise<{ getTextContent(): Promise<{ items: Array<{ str?: string }> }> }>;
    }>;
  };
}

declare module "react-markdown" {
  const ReactMarkdown: (props: { [key: string]: unknown }) => string;
  export default ReactMarkdown;
}

declare module "remark-gfm" {
  const remarkGfm: unknown;
  export default remarkGfm;
}

declare module "@langchain/openai" {
  export const ChatOpenAI: new (options: unknown) => unknown;
}

declare module "@langchain/core/prompts" {
  export const ChatPromptTemplate: {
    fromMessages(messages: unknown): {
      pipe(model: unknown): {
        invoke(inputs: unknown): Promise<{ content: unknown }>;
      };
    };
  };
}

declare module "@langchain/core/tracers/tracer_langchain" {
  export class LangChainTracer {
    constructor(options?: unknown);
    tracingMetadata: Record<string, unknown>;
    fields: Record<string, unknown>;
    tracingTags: string[];
    runMap: Map<string, unknown>;
    runTreeMap: Map<string, unknown>;
    copyWithTracingConfig(options?: unknown): LangChainTracer;
    _addRunToRunMap(run: Record<string, unknown>): void;
    onRunCreate(run: unknown): Promise<void>;
    onRunUpdate(run: unknown): Promise<void>;
  }
  export const OVERRIDABLE_LANGSMITH_INHERITABLE_METADATA_KEYS: Set<string>;
  export type Run = Record<string, unknown>;
}

declare module "@langchain/langgraph" {
  export function Annotation<T = unknown>(...args: unknown[]): T;
  export namespace Annotation {
    export function Root<T = unknown>(...args: unknown[]): T;
  }
  export const END: unknown;
  export const START: unknown;
  export type StateGraphBuilder = {
    addNode(name: string, node: unknown): StateGraphBuilder;
    addEdge(source: unknown, target: unknown): StateGraphBuilder;
    addConditionalEdges(source: string, condition: unknown, routes: unknown): StateGraphBuilder;
    compile(): { invoke(state: unknown, options?: unknown): Promise<Record<string, unknown>> };
  };
  export const StateGraph: new (...args: unknown[]) => StateGraphBuilder;
}
