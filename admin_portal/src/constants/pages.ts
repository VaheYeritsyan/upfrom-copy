export abstract class Pages {
  static LOGIN = '/login';
  static AUTH_CALLBACK = '/auth/callback';

  static DASHBOARD = '/';
  static USERS = '/users';
  static TEAMS = '/teams';
  static ORGANIZATIONS = '/organizations';
  static MEMBERS = '/members';
  static INVITED_MEMBERS = '/invited-members';
  static EVENTS = '/events';
  static ONGOING_EVENTS = '/ongoing-events';
  static GUESTS = '/guests';
  static ADMINS = '/admins';
  static CHARTS = '/charts';
  static CALENDAR = '/calendar';

  static getUserPageLink(id?: string | null, path?: string) {
    if (!id) return null;

    return `${this.USERS}/${id}${path || ''}`;
  }

  static getTeamPageLink(id?: string | null, path?: string) {
    if (!id) return null;

    return `${this.TEAMS}/${id}${path || ''}`;
  }

  static getOrganizationPageLink(id?: string | null, path?: string) {
    if (!id) return null;

    return `${this.ORGANIZATIONS}/${id}${path || ''}`;
  }

  static getEventPageLink(id?: string | null, path?: string) {
    if (!id) return null;

    return `${this.EVENTS}/${id}${path || ''}`;
  }

  static getDashboardPageLink(path?: string) {
    return `${path || this.DASHBOARD}`;
  }

  static getTeamCalendarPageLink(teamId: string) {
    const params = new URLSearchParams({ teamId });

    return `${this.CALENDAR}?${params}`;
  }

  static getOrganizationCalendarPageLink(organizationId: string) {
    const params = new URLSearchParams({ organizationId });

    return `${this.CALENDAR}?${params}`;
  }

  static isDashboard(pathname: string) {
    return this.dashboardPagesSet.has(pathname);
  }

  static isPublic(pathname: string) {
    return this.publicPagesSet.has(pathname);
  }

  static getNavigationTabs() {
    return [
      { path: this.getDashboardPageLink(), label: 'Reporting' },
      { path: this.getDashboardPageLink(Pages.USERS), label: 'Users' },
      { path: this.getDashboardPageLink(Pages.ORGANIZATIONS), label: 'Organizations' },
      { path: this.getDashboardPageLink(Pages.TEAMS), label: 'Teams' },
      { path: this.getDashboardPageLink(Pages.EVENTS), label: 'Events' },
      { path: this.getDashboardPageLink(Pages.ADMINS), label: 'Admins' },
      { path: this.getDashboardPageLink(Pages.CALENDAR), label: 'Calendar' },
    ];
  }

  private static publicPagesSet = new Set([this.LOGIN, this.AUTH_CALLBACK]);

  private static dashboardPagesSet = new Set([
    this.DASHBOARD,
    this.USERS,
    this.TEAMS,
    this.EVENTS,
    this.ADMINS,
    this.CALENDAR,
  ]);
}
