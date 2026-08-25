import fs from "node:fs"
import { getStatsTg } from "../../config/db.js";


export function cmd(cmd){
    return fs.readFileSync(`./tgbot/constants/${cmd}.md`).toString();
}
export function getMediaDetails(message){
  console.log(message.media.document.attributes)
  return {id : message.id,filesize : size(message.media.document.size),filename : message.media.document.attributes.find(f=>f.className === "DocumentAttributeFilename").fileName};
}
export function size(n){
  const val = (Number(n) / (1024 *1024)).toFixed(1);
  return val > 1000 ? `${val/1000} GB` : `${val} MB`
}
export function genLink({id,filesize,filename}){
  return cmd("link").replaceAll("{id}",id).replace("{filename}",filename).replace("{filesize}",filesize);
}
function formatUptime(seconds) {
    seconds = Math.floor(seconds);

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
export function stat(){
  const uptime = process.uptime();
  const {botcount,workload} = getStatsTg()
  return cmd("stat").replace("{uptime}",formatUptime(uptime)).replace("{botcount}",botcount).replace("{workload}",workload);
}