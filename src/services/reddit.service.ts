import { Injectable } from '@nestjs/common';
// import { getPost, getImage } from 'random-reddit';
const { getPost, getImage } = require('random-reddit')

@Injectable()
export class RedditService {
  constructor() {

  }

  async getRedditImage(fromSubReddit: string) {
    try {
      const image = await getImage(fromSubReddit);
      return image;
    } catch (error) {
      return error;
    }
  }
}
