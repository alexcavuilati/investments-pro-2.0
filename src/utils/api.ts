export async function safeFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error(`Expected JSON from ${url} but got ${contentType}:`, text.substring(0, 100));
    throw new Error(`Server returned non-JSON response (${res.status}) for ${url}. Please check if the API route exists.`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  
  return data;
}
