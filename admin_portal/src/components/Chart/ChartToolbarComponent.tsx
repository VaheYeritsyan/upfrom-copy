import React, { FC, MouseEvent } from 'react';
import { Toolbar, Typography, Box, MenuItem, ListItemIcon } from '@mui/material';
import { Check, FilterList } from '@mui/icons-material';
import { ChartSeries } from '~/types/chart';
import { MenuComponent } from '~/components/Menu/MenuComponent';
import styles from './chart-toolbar.module.scss';

type Entity = Record<'createdAt', number>;
export type Props = {
  className?: string;
  title: string;
  isLoading?: boolean;
  series: ChartSeries<Entity>[];
  hiddenSeries: string[];
  onSeriesItemClick?: (event: MouseEvent<HTMLElement>) => void;
};

export const ChartToolbarComponent: FC<Props> = ({ title, series, isLoading, hiddenSeries, onSeriesItemClick }) => (
  <Toolbar className={styles.chartToolbar}>
    <Box className={styles.chartToolbarContent}>
      <Typography variant="h6" id="tableTitle" component="div">
        {title}
      </Typography>

      <Box className={styles.chartToolbarActionButtons}>
        <MenuComponent isDisabled={isLoading} MenuIcon={FilterList} tooltipTitle="Settings" placement="bottom-end">
          {series.map(seriesItem => (
            <MenuItem id={seriesItem.label} onClick={onSeriesItemClick} key={seriesItem.label}>
              <ListItemIcon>
                {hiddenSeries.includes(seriesItem.label) ? null : <Check sx={{ color: seriesItem.color }} />}
              </ListItemIcon>
              {seriesItem.label}
            </MenuItem>
          ))}
        </MenuComponent>
      </Box>
    </Box>
  </Toolbar>
);
