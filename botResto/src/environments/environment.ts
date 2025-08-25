// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  supabase: {
    url: 'https://ymlzjvposzzdgpksgvsn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbHpqdnBvc3p6ZGdwa3NndnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjIyMTksImV4cCI6MjA3MTQzODIxOX0.vMq49kBoK-uXBr2mDhs0dakwUnZts-BBqVSympdDjgY'
  },
  greenApiToken: 'dev-token-placeholder' // À remplacer par le vrai token de dev
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
