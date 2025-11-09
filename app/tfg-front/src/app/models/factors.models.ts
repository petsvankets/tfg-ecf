export interface FactorItem {
  id: string;       // IRI del recurso factor
  name: string;     // etiqueta legible
  unit: string;
  country: string;
  latestValue?: number;
  latestYear?: number;
}

export interface FactorsResponse {
  items: FactorItem[];
  total: number;
}

export interface FactorSeriesPoint {
  year: number;
  value: number;
}

export interface FactorTimeseries {
  id: string;
  name: string;
  unit: string;
  series: FactorSeriesPoint[];
}
