import * as Jimp from 'jimp';
export default async (
  images: string[],
  width = 400,
  height: number = Jimp.AUTO,
  quality = 90,
): Promise<void> => {
  await Promise.all(
    images.map(async imgPath => {
      const image = await Jimp.read(imgPath);
      await image.resize(width, height);
      await image.quality(quality);
      await image.writeAsync(imgPath);
    }),
  );
};
