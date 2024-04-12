import NodeCache from "node-cache";

const Cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export default Cache;