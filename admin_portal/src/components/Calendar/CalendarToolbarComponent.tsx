import React, { FC, PropsWithChildren } from 'react';
import { Control } from 'react-hook-form';
import { Toolbar, Typography, Box, Button } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { Organization, Team } from '@up-from/graphql-ap/genql';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';
import { IconButtonComponent } from '~/components/Button/IconButtonComponent';
import { AutocompleteInputOptionComponent } from '~/components/Input/AutocompleteInputOptionComponent';
import { CalendarView } from '~/types/calendar';
import { filterOrganizationOptions, filterTeamOptions } from '~/util/autocomplete';
import styles from './calendar-toolbar.module.scss';

export type FormValues = {
  date: Date;
  view: CalendarView;
  team?: Omit<Team, 'disabledUsers' | 'disabledUserIds' | 'members' | 'events'> | null;
  organization?: Organization | null;
};

type Props = PropsWithChildren & {
  control: Control<FormValues>;
  date: Date | null;
  loadingText: string | null;
  isLoading?: boolean;
  isFilterVisible?: boolean;
  onFilterClick?: () => void;
  teams: Omit<Team, 'disabledUsers' | 'disabledUserIds' | 'members' | 'events'>[];
  organizations: Organization[];
  isTeamsLoading?: boolean;
  isOrganizationsLoading?: boolean;
  onResetFiltersClick?: () => void;
};

export const CalendarToolbarComponent: FC<Props> = ({
  control,
  teams,
  loadingText,
  isFilterVisible,
  isTeamsLoading,
  isOrganizationsLoading,
  organizations,
  date,
  children,
  isLoading,
  onFilterClick,
  onResetFiltersClick,
}) => {
  return (
    <Toolbar className={styles.calendarToolbar}>
      <Box className={styles.calendarToolbarContent}>
        <Box className={styles.calendarToolbarContentLeft}>
          <Typography variant="h6" id="calendarTitle" component="div" lineHeight={1.2}>
            {date ? date.toLocaleDateString('en-us', { month: 'long', year: 'numeric' }) : 'Loading...'}
          </Typography>
          {loadingText ? (
            <Typography variant="body2" color="textSecondary">
              {loadingText}
            </Typography>
          ) : null}
        </Box>

        <Box className={styles.calendarToolbarActionButtons}>
          {children}

          {onFilterClick ? (
            <IconButtonComponent
              tooltipTitle="Filter events"
              onClick={onFilterClick}
              color={isFilterVisible ? 'primary' : 'inherit'}
              disabled={isLoading}>
              <FilterList />
            </IconButtonComponent>
          ) : null}
        </Box>
      </Box>

      {isFilterVisible ? (
        <Box className={styles.calendarToolbarFilters}>
          <form>
            <AutocompleteInputComponent
              control={control}
              name="organization"
              label="Organization"
              size="small"
              isOptionEqualToValue={(option, value) => option.id === value.id}
              isLoading={isOrganizationsLoading}
              getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
              filterOptions={filterOrganizationOptions}
              variant="outlined"
              options={organizations}
              renderOption={(props, org) => (
                <AutocompleteInputOptionComponent
                  {...props}
                  key={org.id}
                  title={org.name}
                  subtitle={org.id}
                  withoutImg
                />
              )}
            />

            <AutocompleteInputComponent
              control={control}
              name="team"
              label="Team"
              size="small"
              isOptionEqualToValue={(option, value) => option.id === value.id}
              isLoading={isTeamsLoading}
              getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
              filterOptions={filterTeamOptions}
              variant="outlined"
              options={teams}
              renderOption={(props, team) => (
                <AutocompleteInputOptionComponent
                  {...props}
                  key={team.id}
                  imgSrc={team.imageUrl}
                  title={team.name}
                  subtitle={team.id}
                  isImgCircle={false}
                />
              )}
            />

            <Button size="small" color="inherit" onClick={onResetFiltersClick}>
              Reset
            </Button>
          </form>
        </Box>
      ) : null}
    </Toolbar>
  );
};
