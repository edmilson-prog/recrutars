/**
 * Anthropic Models Service
 * Busca lista de modelos disponíveis via API Anthropic
 */

const MODELS_URL = '/api/anthropic/v1/models';

export interface AnthropicModel {
  id: string;
  display_name: string;
  created_at: string;
  type: string;
}

interface ModelsResponse {
  data: AnthropicModel[];
  has_more: boolean;
  first_id: string;
  last_id: string;
}

export async function fetchAnthropicModels(): Promise<AnthropicModel[]> {
  const allModels: AnthropicModel[] = [];
  let afterId: string | undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const url = new URL(MODELS_URL, window.location.origin);
    url.searchParams.set('limit', '100');
    if (afterId) url.searchParams.set('after_id', afterId);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const body: ModelsResponse = await response.json();
    allModels.push(...body.data.filter((m) => m.type === 'model'));

    if (!body.has_more) break;
    afterId = body.last_id;
  }

  return allModels.sort((a, b) => a.display_name.localeCompare(b.display_name));
}
