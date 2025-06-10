import { FormattedTableRow, TableCell, TableEntity, TableOrder, TableRow } from '~/types/table';
import { Admin, Event, Team, TeamUser, User, Organization } from '@up-from/graphql-ap/genql';
import { getBooleanValue, getFormattedNumber, getTitleFromKey } from '~/util/text';
import { Pages } from '~/constants/pages';
import { UserWithAttendance } from '~/types/eventUsers';
import { isBirthdayKey, isDateKey } from '~/util/date';
import { replaceSpecialCharacters } from '~/util/autocomplete';
import { getUserTeamRole } from 'frontend/src/utils/organizationAndTeams';

export const searchTable = <Entity extends TableEntity>(
  rows: TableRow<Entity>[],
  searchBy?: keyof Entity | null,
  searchFor?: string | (string | Date)[],
  getCellValue?: <EntityKey extends keyof Entity>(
    cellKey: EntityKey,
    entity: Entity,
  ) => FormattedTableRow<Entity>[keyof Entity] | null,
) => {
  if (!searchBy || !searchFor) return rows;
  return rows.filter(row => {
    const customValue = getCellValue?.(searchBy, row);
    const label = customValue?.label || row[searchBy];
    const value = (customValue?.value || row[searchBy]) as number | string;
    const isDate = isDateKey(searchBy) || isBirthdayKey(searchBy);
    const valueForRangeSearch = (Array.isArray(value) ? value.length : value) as number;
    const valueForDateRangeSearch = (isDate && typeof value !== 'number' ? new Date(value).getTime() : value) as number;

    if (Array.isArray(searchFor)) {
      const [minValue, maxValue] = searchFor;
      if (!minValue && !maxValue) return true;

      if (minValue instanceof Date && maxValue instanceof Date) {
        return valueForDateRangeSearch >= minValue.getTime() && valueForDateRangeSearch <= maxValue.getTime();
      } else {
        const [min, max] = [minValue || 0, maxValue || minValue];
        return valueForRangeSearch >= Number(min) && valueForRangeSearch <= Number(max);
      }
    }

    return new RegExp(replaceSpecialCharacters(searchFor), 'i').test(label);
  });
};

export const descendingComparator = <Entity extends TableEntity>(
  a: FormattedTableRow<Entity>,
  b: FormattedTableRow<Entity>,
  orderBy: keyof Entity,
) => {
  const bValue = typeof b[orderBy].value === 'object' ? b[orderBy].label : b[orderBy].value;
  const aValue = typeof a[orderBy].value === 'object' ? a[orderBy].label : a[orderBy].value;

  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
};

export const getComparator = <Entity extends TableEntity>(
  order: TableOrder,
  orderBy: keyof Entity | null,
): ((a: FormattedTableRow<Entity>, b: FormattedTableRow<Entity>) => number) | null => {
  if (!orderBy) return null;

  return (a, b) => {
    const comparator = descendingComparator(a, b, orderBy);

    return order === TableOrder.DESC ? comparator : -comparator;
  };
};

export const sortTable = <Entity extends TableEntity>(
  array: FormattedTableRow<Entity>[],
  comparator: ((a: FormattedTableRow<Entity>, b: FormattedTableRow<Entity>) => number) | null,
) => {
  if (!comparator) return array;

  const stabilizedThis = array.map((el, index) => [el, index] as [FormattedTableRow<Entity>, number]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });

  return stabilizedThis.map(el => el[0]);
};

export const getCsvContent = <Entity extends TableEntity>(
  rows: TableRow<Entity>[],
  orderBy?: keyof Entity | null,
  order?: TableOrder,
) => {
  if (!rows.length) return;

  const header = Object.keys(rows[0])
    .map(cell => {
      const isOrderByCell = cell === orderBy;

      return `${getTitleFromKey(cell)}${isOrderByCell ? ` [${order}]` : ''}`;
    })
    .join(';');
  const body = rows
    .map(row =>
      Object.values(row)
        .map(cell => {
          if (typeof cell === 'string' && cell.startsWith('http')) {
            return cell.split('#')[0];
          }

          return cell;
        })
        .join(';'),
    )
    .join('\n');

  return `${header}\n${body}`;
};

export const getRawTableRow = <Entity extends TableEntity>(row: FormattedTableRow<Entity>): TableRow<Entity> => {
  const keys = Object.keys(row);

  return Object.fromEntries(keys.map(key => [key, row[key].label])) as TableRow<Entity>;
};

export const getAdminsTableCellValue = (cell: keyof Admin, entity: Admin): TableCell<Admin> | null => {
  switch (cell) {
    case 'isDisabled':
      return { label: getBooleanValue(entity.isDisabled), value: entity.isDisabled };

    default:
      return null;
  }
};

export const getEventsTableCellValue = (cell: keyof Event, entity: Event): TableCell<Event> | null => {
  switch (cell) {
    case 'team':
      return { label: entity.team?.name || '[All Teams]', value: entity.team };

    case 'owner':
      return { label: `${entity.owner?.firstName} ${entity.owner?.lastName}`, value: entity.owner };

    case 'location':
      return { label: entity.location?.locationName || '-', value: entity.location };

    case 'isCancelled':
      return { label: getBooleanValue(entity.isCancelled), value: entity.isCancelled };

    case 'isIndividual':
      return { label: getBooleanValue(entity.isIndividual), value: entity.isIndividual };

    default:
      return null;
  }
};

export const getEventsTableCellLink = (cell: keyof Event, row: FormattedTableRow<Event>) => {
  switch (cell) {
    case 'team':
      return Pages.getTeamPageLink(row.team?.value?.id);

    case 'owner':
      return Pages.getUserPageLink(row.owner?.value?.id);

    case 'guests':
      return Pages.getEventPageLink(row.id?.value, Pages.GUESTS);

    default:
      return null;
  }
};

export const getUsersTableCellValue = (
  cell: keyof UserWithAttendance,
  entity: UserWithAttendance,
): TableCell<UserWithAttendance> | null => {
  switch (cell) {
    case 'teams':
      return { label: entity.teams.map(({ name }) => name).join(', '), value: entity.teams };

    case 'isDisabled':
      return { label: getBooleanValue(entity.isDisabled, ['Yes', 'No']), value: entity.isDisabled };

    case 'isAttending':
      return {
        label: getBooleanValue(entity.isAttending, ['Yes', 'No', 'Pending']),
        value: entity.isAttending,
      };

    default:
      return null;
  }
};

export const getUsersTableCellLink = (cell: keyof UserWithAttendance, row: FormattedTableRow<UserWithAttendance>) => {
  switch (cell) {
    case 'teams':
      return row.teams.value.map((team: Team) => Pages.getTeamPageLink(team.id));

    default:
      return null;
  }
};

type TeamMember = Pick<TeamUser, 'role'> & User;

export const getTeamUsersTableCellValue = (cell: keyof TeamMember, entity: TeamMember): TableCell<TeamUser> | null => {
  switch (cell) {
    case 'role':
      return { label: entity.role, value: entity.role };

    default:
      return getUsersTableCellValue(cell, entity);
  }
};

export const getTeamUsersTableCellLink = (cell: keyof TeamMember, row: FormattedTableRow<TeamMember>) => {
  return getUsersTableCellLink(cell as keyof UserWithAttendance, row as FormattedTableRow<UserWithAttendance>);
};

export const filerTeamMembers = (members: TeamUser[]) => {
  return members.filter(member => !!member.user?.isSignupCompleted);
};

type UserTeam = Team & { role?: string };

export const getTeamsTableCellLink = <T extends Team>(cell: keyof T, row: FormattedTableRow<T>) => {
  switch (cell) {
    case 'members':
      return Pages.getTeamPageLink(row?.id.value);

    case 'organization':
      return Pages.getOrganizationPageLink(row.organization?.value?.id);

    default:
      return null;
  }
};

export const getTeamsTableCellValue = (cell: keyof Team, entity: Team): TableCell<Team> | null => {
  switch (cell) {
    case 'members':
      return {
        label: getFormattedNumber(filerTeamMembers(entity.members)?.length || 0) as string,
        value: filerTeamMembers(entity.members).length,
      };

    case 'organization':
      return {
        label: entity.organization.name,
        value: entity.organization,
      };

    case 'isDisabled':
      return { label: getBooleanValue(entity.isDisabled, ['Yes', 'No']), value: entity.isDisabled };

    default:
      return null;
  }
};

export const getOrganizationsTableCellLink = <T extends Organization>(cell: keyof T, row: FormattedTableRow<T>) => {
  switch (cell) {
    case 'teams':
      return Pages.getOrganizationPageLink(row?.id.value);

    default:
      return null;
  }
};

export const getOrganizationsTableCellValue = (
  cell: keyof Organization,
  entity: Organization,
): TableCell<Organization> | null => {
  switch (cell) {
    case 'teams':
      return {
        label: getFormattedNumber(entity.teams.length) as string,
        value: entity.teams.length,
      };

    default:
      return null;
  }
};

export const getUserTeamsTableCellValue =
  (userId: string) =>
  (cell: keyof UserTeam, entity: UserTeam): TableCell<UserTeam> | null => {
    switch (cell) {
      case 'role':
        return {
          label: getUserTeamRole(entity.members, userId),
          value: getUserTeamRole(entity.members, userId),
        };

      default:
        return getTeamsTableCellValue(cell, entity);
    }
  };

export const getEventsTableRowLink = ({ id }: TableRow<Event>) => {
  return Pages.getEventPageLink(id);
};

export const getUsersTableRowLink = ({ id }: TableRow<UserWithAttendance>) => {
  return Pages.getUserPageLink(id);
};

export const getOrganizationsTableRowLink = ({ id }: TableRow<Organization>) => {
  return Pages.getOrganizationPageLink(id);
};

export const getTeamUsersTableRowLink = ({ id }: TableRow<TeamMember>) => {
  return Pages.getUserPageLink(id);
};

export const getTeamsTableRowLink = ({ id }: TableRow<Team>) => {
  return Pages.getTeamPageLink(id);
};
