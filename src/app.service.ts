import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { bindCallback, from, Observable, Subject } from 'rxjs';
import { IrcEvent } from './model/event.interface';
import { EnvironmentVariables } from './model/environment.interface';
import { MessageMatch } from './model/message-match.interface';

// import { IRC } from 'irc-framework';


// import IRC from 'irc-framework';

const IrcFramework = require('irc-framework');



@Injectable()
export class AppService {

  channelMap: Map<string, any>;

  protected eventSubject: Subject<IrcEvent>;
  protected messageMatchSubject: Subject<MessageMatch>;

  on$: Observable<any>;
  public bot;

  public env: EnvironmentVariables;


  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {

    this.env = {
      ircHost: this.configService.get<string>('IRC_HOST'),
      ircPort: this.configService.get<string>('IRC_PORT'),
      nick: this.configService.get<string>('NICK'),
      username: this.configService.get<string>('USER_NAME'),
      defaultChannel: this.configService.get<string>('DEFAULT_CHANNEL')
    }

    console.log('env: ', this.env)

    this.channelMap = new Map();

    this.eventSubject = new Subject();
    this.messageMatchSubject = new Subject();

    this.bot = new IrcFramework.Client({
      // nick: 'degeneraatti-bot',
      // username: 'degeneraatti-bot',
      gecos: 'ircbot',
      encoding: 'utf8',
      version: 'node.js irc-framework',
      enable_chghost: false,
      enable_echomessage: false,
      auto_reconnect: true,
      auto_reconnect_max_wait: 300000,
      auto_reconnect_max_retries: 3,
      ping_interval: 30,
      ping_timeout: 120,
    })

    this.bot.match(/^!r\s/g, this.messageMatch.bind(this))

  }

  get environment() {
    return this.env;
  }

  buffers: any[] = [];

  init() {
    this.connect();
  }

  get events$() {
    return this.eventSubject.asObservable();
  }

  get messages$() {
    return this.messageMatchSubject.asObservable();
  }

  public messageMatch(ev: any) {

    const event = ev;

    const commandPrefix = event.message.trim().split(' ')[0];
    const command = event.message.replace(commandPrefix + ' ', '')

    const messageMatch: MessageMatch = {
      eventName: `irc.message_match.${commandPrefix}`,
      commandPrefix: commandPrefix,
      command: command,
      rawEvent: ev
    }

    // console.log('message match', messageMatch)

    this.messageMatchSubject.next(messageMatch)
    this.eventEmitter.emit(`irc.message_match.${messageMatch.commandPrefix}`, messageMatch)
  }

  public connect() {

    this.bot.connect(
      {
        host: this.env.ircHost,
        port: this.env.ircPort,
        nick: this.env.nick,
        username: this.env.username,
        encoding: 'utf8',

      }
    )
    // console.log(this.bot);

    const ircEvent: IrcEvent = {
      eventName: 'irc.connected',
      data: true
    }

    // this.eventEmitter.emit('irc.connected', ircEvent)
    this.eventSubject.next(ircEvent)

  }

  public register() {
    this.bot.on('registered', (event) => {
      // console.log(ev);

      const ircEvent: IrcEvent = {
        eventName: 'irc.registered',
        data: event
      }
      // this.eventEmitter.emit('irc.registered', ircEvent)
      this.eventSubject.next(ircEvent)

    })
  }

  public joinChannel(name: string) {
    const channel = this.bot.channel(name);

    this.channelMap.set(name, channel);
    // this.buffers.push(channel);

    // console.log('buffers', this.buffers)

    channel.join();

    // console.log(channel.users);
    const ircEvent: IrcEvent = {
      eventName: 'irc.channel_join',
      data: channel
    }

    // this.eventEmitter.emit('irc.channel_join', ircEvent);
    this.eventSubject.next(ircEvent)
  }

  public replyToChannel(channelName: string, message: string) {
    const channel = this.channelMap.get(channelName);
    channel.say(message);
  }


}


