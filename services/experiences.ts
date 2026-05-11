import axios from 'axios';

export const experiencesApiClient = axios.create({
  timeout: 30000,
});

export async function fetchExperiencesFeed() {
  // API implementation will be added with the Pillar 1 feed work.
  return [];
}
