import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image, type ImageLoadEventData } from "expo-image";

import { getCachedVideoPoster, loadVideoPoster, type VideoPoster } from "@/services/video-thumbnails";
import { cardAspectRatio } from "@/utils/media-layout";
import { isInAppPlayableVideoUrl } from "@/utils/reels";

type Props = {
  /** Photo URL, or the provided thumbnail of a video (YouTube). */
  imageUrl?: string | null;
  /** Video file URL; when no thumbnail is provided, the first frame is generated on the phone. */
  videoUrl?: string | null;
  children?: React.ReactNode;
};

/** Remembered shapes so recycled feed cards do not jump while their image loads again. */
const shapeByPath = new Map<string, number>();
const pathOf = (url: string) => url.split("?")[0];

/**
 * Feed media that is never cropped: the card takes the media's shape (4:5 … 1.91:1), the whole
 * picture is shown with "contain", and any leftover area is filled with a blurred copy.
 */
export function CardMedia({ children, imageUrl, videoUrl }: Props) {
  const generateFromVideo = !imageUrl && isInAppPlayableVideoUrl(videoUrl);
  const [poster, setPoster] = useState<VideoPoster | null | undefined>(() =>
    generateFromVideo && videoUrl ? getCachedVideoPoster(videoUrl) : undefined
  );
  const shapeKey = imageUrl ? pathOf(imageUrl) : videoUrl ? pathOf(videoUrl) : "";
  const [aspect, setAspect] = useState(() => shapeByPath.get(shapeKey) ?? cardAspectRatio());

  useEffect(() => {
    if (!generateFromVideo || !videoUrl || poster !== undefined) return;
    let active = true;
    void loadVideoPoster(videoUrl).then((result) => {
      if (!active) return;
      setPoster(result);
      if (result) {
        const ratio = cardAspectRatio(result.width, result.height);
        shapeByPath.set(shapeKey, ratio);
        setAspect(ratio);
      }
    });
    return () => {
      active = false;
    };
  }, [generateFromVideo, poster, shapeKey, videoUrl]);

  const onImageLoad = (event: ImageLoadEventData) => {
    const ratio = cardAspectRatio(event.source.width, event.source.height);
    shapeByPath.set(shapeKey, ratio);
    setAspect(ratio);
  };

  const source = imageUrl ? { uri: imageUrl } : poster?.thumbnail ?? null;

  return (
    <View style={[styles.box, { aspectRatio: aspect }]}>
      {source ? (
        <>
          <Image
            blurRadius={28}
            cachePolicy="memory-disk"
            contentFit="cover"
            source={source}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.dim} />
          <Image
            accessibilityIgnoresInvertColors
            cachePolicy="memory-disk"
            contentFit="contain"
            onLoad={imageUrl ? onImageLoad : undefined}
            recyclingKey={shapeKey}
            source={source}
            style={StyleSheet.absoluteFill}
            transition={150}
          />
        </>
      ) : (
        <View style={styles.placeholder} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#1F1A17",
    width: "100%",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#2A221D",
  },
});
