import { Controller, Get } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Subscription } from 'rxjs';
import { AppService } from './app.service';
import { RedditService } from './services/reddit.service';

@Controller()
export class AppController {

  subMap: Map<string, Subscription> = new Map()

  public bot;

  private defaultChannel = "#bottingtest";

  constructor(
    private readonly appService: AppService,
    private redditService: RedditService
  ) {

    if (this.appService.environment.defaultChannel) {
      this.defaultChannel = this.appService.environment.defaultChannel
    }

    this.subMap.set('events', this.appService.events$.subscribe((event) => {
      console.log('events from subject: ', event)

      if (event.eventName === 'irc.connected') {
        this.appService.register();
      } else if (event.eventName === 'irc.registered') {
        this.appService.joinChannel(this.defaultChannel)
      }

    }))

    this.subMap.set('messageMatches', this.appService.messages$.subscribe(async (messageMatch) => {
      // console.log('message MATCH:', messageMatch)

      if (messageMatch && messageMatch.commandPrefix === '!r') {
        const image = await this.redditService.getRedditImage(messageMatch.command)
          .catch((error) => {
            console.log('error: ', error)
          })

        const message = `result ${messageMatch.command} :: ${image ? image : null} `
        console.log(message)

        this.appService.replyToChannel(this.defaultChannel, message);
      }
    }))

    this.appService.init();


  }

  // @OnEvent('irc.registered')
  // ircConnected(payload: boolean) {
  //   // this.appService.joinChannel('#bottingtest'); 
  // }

  // @OnEvent('**')
  // anyEvent(payload: any) {
  //   // console.log('** event: ', payload)
  // }

}
