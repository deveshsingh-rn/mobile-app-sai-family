export const selectExperiencesFeed = (
  state: any
) => state.experiences.feed;

export const selectExperiencesLoading = (
  state: any
) => state.experiences.loading;

export const selectCreateExperienceLoading =
  (state: any) =>
    state.experiences.creating;

export const selectExperiencesError = (
  state: any
) => state.experiences.error;