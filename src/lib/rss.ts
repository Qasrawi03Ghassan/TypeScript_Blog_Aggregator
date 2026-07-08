import { desc } from 'drizzle-orm';
import {XMLParser} from 'fast-xml-parser';
import { link } from 'node:fs';

let xmlParser: XMLParser = new XMLParser({processEntities:false});

export type RSSFeed = {
    channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeed(feedUrl: string){
    let resp = await fetch(feedUrl,{
        method:"GET",
        headers:{
            "User-Agent":"gator"
        }
    });

    let fetchedXml = await resp.text();
    let parsedXml = xmlParser.parse(fetchedXml);

    if(!parsedXml.rss.channel){
        throw new Error('ERROR: Channel field does not exist!');
    }

    let channel = parsedXml.rss.channel;
    if(!channel.title || !channel.link || !channel.description){
        throw new Error('ERROR: one of channel fields does not exist!');
    }

    let items;
    if(Array.isArray(channel.item)){
        items = channel.item;
    }
    else if(!channel.item){
        items = [];
    }else{
        let x = channel.item;
        items = [x];
    }

    let validItems = [];
    for(let item of items){
        if(!item.title || !item.link || !item.description || !item.pubDate)continue;
        validItems.push({
            title:item.title,
            link:item.link,
            description:item.description,
            pubDate:item.pubDate,
        });
    }

    return {channel:{
        title:channel.title,
        link:channel.link,
        description: channel.description,
        item: validItems
    }};
}