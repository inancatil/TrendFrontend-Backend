/**
 * Removes _id and __v properties from given object and returns it.
 */
export const correctResponse = (obj: any) => {
  const newObj = obj;
  newObj.hasOwnProperty("_id") && delete newObj["_id"];
  newObj.hasOwnProperty("__v") && delete newObj["__v"];
  return newObj;
};

export const titleToUrlFormat = (title: string, count: number): string => {
  const url = title.replace(/[^a-zA-Z0-9 ]/g, "").trimEnd().replace(/\s/g, "-").toLowerCase();
  if (count > 0) return `${url}-${count}`
  return url
}