export interface Server {
  id: string | undefined;
  name: string;
  description: string;
  url: string;
}

export function emptyServer(): Server {
  return {
    id: undefined,
    name: "",
    description: "",
    url: ""
  };
}
