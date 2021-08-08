import mockPokeBall from 'src/poke-balls/poke-ball.mock';
import { User } from './user.entity';

const baseUser: User = {
  id: 'mockUserId',
  nickname: 'Benjamin',
  introduce: null,
  lastContributions: 0,
  lastDonationDate: null,
  accessToken: 'mockAccessToken',
  isActive: true,
  createdAt: new Date('2021-07-01'),
  updatedAt: new Date('2021-07-01'),
  contributionBaseDate: new Date('2021-07-01'),
  pokeBall: Promise.resolve(mockPokeBall.basePokeBall),
  pokeBallId: 1,
  githubUser: {
    login: 'eunvanz',
    id: 17351661,
    node_id: 'MDQ6VXNlcjE3MzUxNjYx',
    avatar_url: 'https://avatars.githubusercontent.com/u/17351661?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/eunvanz',
    html_url: 'https://github.com/eunvanz',
    followers_url: 'https://api.github.com/users/eunvanz/followers',
    following_url:
      'https://api.github.com/users/eunvanz/following{/other_user}',
    gists_url: 'https://api.github.com/users/eunvanz/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/eunvanz/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/eunvanz/subscriptions',
    organizations_url: 'https://api.github.com/users/eunvanz/orgs',
    repos_url: 'https://api.github.com/users/eunvanz/repos',
    events_url: 'https://api.github.com/users/eunvanz/events{/privacy}',
    received_events_url: 'https://api.github.com/users/eunvanz/received_events',
    type: 'User',
    site_admin: false,
    name: 'Benjamin',
    company: 'Kakaopay',
    blog: '',
    location: 'Seoul, South Korea',
    email: null,
    hireable: null,
    bio: null,
    twitter_username: null,
    public_repos: 18,
    public_gists: 11,
    followers: 3,
    following: 1,
    created_at: '2016-02-20T08:30:27Z',
    updated_at: '2021-07-24T17:42:24Z',
  },
};

const mockUser = {
  baseUser,
};

export default mockUser;
