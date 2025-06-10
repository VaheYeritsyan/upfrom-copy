import React, { FC, MouseEvent, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Paper, Slider, Typography } from '@mui/material';
import { ChartSeries } from '~/types/chart';
import { getFullDate } from '~/util/date';
import { ChartToolbarComponent } from '~/components/Chart/ChartToolbarComponent';
import styles from './chart-component.module.scss';
import clsx from 'clsx';

const LineChart = dynamic(() => import('@mui/x-charts/LineChart').then(m => m.LineChart), {
  ssr: false,
});

type Entity = Record<'createdAt', number>;
type Props = {
  series: ChartSeries<Entity>[];
  isLoading?: boolean;
  title?: string;
};

const DAY_IN_MILLISECONDS = 8.64e7;

const getScale = (min: number, max: number, input: number) => {
  return ((input - min) * 100) / (max - min);
};

const getMinDate = (min?: number | null, max?: number | null, scale?: number | null) => {
  if (!min || !max || !scale) return new Date(min || '');

  return new Date(min + (scale / 100) * (max - min));
};

const defaultKey = 'createdAt';

export const ProgressionChartComponent: FC<Props> = ({ series, isLoading, title = 'Chart' }) => {
  const [scale, setScale] = useState<number | null>(null);
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  const { dates, maxDate, maxDateTime, minDateTime } = useMemo(() => {
    if (isLoading) return { dates: [], maxDate: null, maxDateTime: null, minDate: null, minDateTime: null };

    const minTimestamp = Math.min(
      ...series.map(({ data, key }) => data.map(entity => entity[key || defaultKey] as number)).flat(1),
    );
    if (!minTimestamp) return { dates: [], maxDate: null, maxDateTime: null, minDate: null, minDateTime: null };

    const minDate = new Date(minTimestamp);
    minDate.setHours(0);
    minDate.setMinutes(0);
    minDate.setSeconds(0);
    minDate.setMilliseconds(0);
    // MUI chart doesn't show the day last day
    minDate.setDate(minDate.getDate() - 2);
    const minDateTime = minDate.getTime();

    const maxDate = new Date();
    maxDate.setHours(0);
    maxDate.setMinutes(0);
    maxDate.setSeconds(0);
    maxDate.setMilliseconds(0);
    const maxDateTime = maxDate.getTime();

    const daysCount = (maxDateTime - minDateTime) / DAY_IN_MILLISECONDS;
    const days: Date[] = [];

    for (let day = 1; day <= daysCount; day++) {
      days.push(new Date(minDateTime + DAY_IN_MILLISECONDS * day));
    }

    return { dates: days, minDate, maxDate, minDateTime, maxDateTime };
  }, [isLoading]);

  const chartSeries = useMemo(() => {
    if (!dates.length) return [];

    return series
      .filter(seriesItem => !hiddenSeries.includes(seriesItem.label))
      .map(seriesItem => {
        const res: Record<string, Entity[]> = {};

        seriesItem.data.forEach(item => {
          const date = getFullDate(item[seriesItem.key || defaultKey]);

          if (res[date]) {
            res[date].push(item);
          } else {
            res[date] = [item];
          }
        });

        const data = dates.map(date => {
          const string = getFullDate(date);

          return res[string]?.length || 0;
        });

        return { ...seriesItem, data };
      });
  }, [series, dates, hiddenSeries]);

  const xMax = useMemo(() => {
    if (!chartSeries.length) return 5;
    const array = chartSeries.map(({ data }) => data).flat();

    return Math.max(...array) || 5;
  }, [chartSeries]);

  const isEmpty = useMemo(() => {
    if (isLoading) return true;

    return !series.map(({ data }) => data).flat().length;
  }, [series, isLoading]);

  useEffect(() => {
    if (!maxDateTime) return;

    const time = maxDateTime - 31 * DAY_IN_MILLISECONDS;
    setMinDate(new Date(time));
    setScale(getScale(minDateTime, maxDateTime, time));
  }, [maxDateTime]);

  const handleScaleChange = (_: Event, value: number | number[]) => {
    const v = Array.isArray(value) ? value[0] : value;
    if (v <= 95) setScale(v);
  };

  const handleSeriesItemClick = ({ currentTarget }: MouseEvent<HTMLElement>) => {
    setHiddenSeries(prevState => {
      if (prevState.includes(currentTarget.id)) {
        return prevState.filter(item => item !== currentTarget.id);
      } else {
        return [...prevState, currentTarget.id];
      }
    });
  };

  return (
    <Paper>
      <ChartToolbarComponent
        title={title}
        isLoading={isLoading}
        hiddenSeries={hiddenSeries}
        onSeriesItemClick={handleSeriesItemClick}
        series={series}
      />

      <Box className={styles.chartContainer}>
        <Box className={styles.chartHeader}>
          {series.map(seriesItem => (
            <Box
              className={clsx(
                styles.chartHeaderLegendItem,
                hiddenSeries.includes(seriesItem.label) && styles.chartHeaderLegendItemHidden,
              )}
              key={seriesItem.label}>
              <Box className={styles.chartHeaderLegendColor} sx={{ backgroundColor: seriesItem.color }} />
              <Typography variant="subtitle2">{seriesItem.label}</Typography>
            </Box>
          ))}
        </Box>

        {isEmpty || isLoading || !minDate ? (
          <Box className={styles.chartEmptyContainer}>
            <Typography variant="body2">{isLoading ? 'Loading...' : 'No Data'}</Typography>
          </Box>
        ) : (
          <LineChart
            height={500}
            series={chartSeries}
            yAxis={[
              {
                min: 0,
                max: xMax,
                scaleType: 'time',
                valueFormatter: value => Math.round(Number(value)).toString(),
              },
            ]}
            xAxis={[
              {
                data: dates,
                min: getMinDate(minDateTime, maxDateTime, scale) ?? minDate,
                max: maxDate!,
                tickNumber: 5,
                scaleType: 'time',
                valueFormatter: value => getFullDate(value),
              },
            ]}
          />
        )}
      </Box>

      {typeof scale === 'number' && !isEmpty && !isLoading ? (
        <Box className={styles.chartFooter}>
          <Slider
            min={0}
            max={100}
            size="medium"
            track="inverted"
            value={scale}
            step={5}
            onChange={handleScaleChange}
          />
        </Box>
      ) : null}
    </Paper>
  );
};
