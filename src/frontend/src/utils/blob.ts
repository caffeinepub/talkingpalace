import { ExternalBlob } from '../backend';

export async function fileToExternalBlob(file: File): Promise<ExternalBlob> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return ExternalBlob.fromBytes(uint8Array);
}

export async function blobToExternalBlob(blob: Blob): Promise<ExternalBlob> {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return ExternalBlob.fromBytes(uint8Array);
}
