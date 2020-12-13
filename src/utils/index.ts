/**
    * Removes _id and __v properties from given object and returns it.
 */
export const correctResponse = (obj: any) => {
    const newObj = obj;
    newObj.hasOwnProperty("_id") && delete newObj["_id"];
    newObj.hasOwnProperty("__v") && delete newObj["__v"];
    return newObj;
}