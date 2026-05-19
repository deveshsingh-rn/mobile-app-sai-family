export const selectExperiencesFeed = (
  state: any
) => state.experiences.feed;

export const selectExperiencesLoading = (
  state: any
) => state.experiences.loading;

export const selectCreateExperienceLoading =
  (state: any) =>
    state.experiences.creating;

export const selectExperienceCategories =
  (state: any) =>
    state.experiences.categories;

export const selectExperienceCategoriesLoading =
  (state: any) =>
    state.experiences.categoriesLoading;

export const selectExperiencesError = (
  state: any
) => state.experiences.error;
