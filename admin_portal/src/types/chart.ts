import { LineChartProps } from '@mui/x-charts/LineChart/LineChart';
import { TableEntity } from '~/types/table';

export type ChartDataset = {
  value: number;
  date: Date;
};

export type ChartSeries<Entity extends TableEntity> = Omit<
  LineChartProps['series'][0],
  'data' | 'label' | 'dataKey'
> & {
  data: Entity[];
  label: string;
  key?: keyof Entity;
};
