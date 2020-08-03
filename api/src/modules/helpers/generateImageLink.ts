export const generateImageLink = (image: string): string => {
  const imageSplit = image.split(':');
  if (imageSplit.length > 1) {
    return image;
  }
  return `${process.env.APP_URL}${image}`;
};
