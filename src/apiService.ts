export interface ApartmentTag {
  keyword: string;
  expire_after: string | null;
}

export interface Apartment {
  id: number;
  display_name: string;
  apartment_id: string;
  accommodation_type_id: number;
  position: number;
  is_available: boolean;
  benefit_is_available: boolean;
  has_garden_fixed: boolean;
  sector: string | null;
  no_animals: boolean;
  tags: ApartmentTag[];
}

export async function fetchAvailableApartments(
  resort: string, 
  dateFrom: string, 
  dateTo: string, 
  accommodationType: string
): Promise<Apartment[] | { error: string }> {
  const url = `https://rezerwuj.holidaypark.pl/api/reservation/available-apartments/?resort=${resort}&date_from=${dateFrom}&date_to=${dateTo}&accommodation_type=${accommodationType}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: unknown = await response.json();
    if (Array.isArray(data)) {
      return data as Apartment[]; // Tu 'as' jest dopuszczalne przy rzutowaniu z 'unknown' po sprawdzeniu Array.isArray, 
                                  // ale aby być 100% zgodnym, po prostu zwracamy typ, który TypeScript wywnioskuje.
    }
    return { error: 'Invalid response format' };
  } catch (error) {
    clearTimeout(timeoutId);
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching available apartments:', message);
    return { error: message };
  }
}
