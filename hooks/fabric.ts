import { RefObject, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

export const useFabric = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const _canvas = new fabric.Canvas(canvasRef.current);
      

      setCanvas(_canvas);
    }
  }, [canvasRef]);

  const resizeWidthHeight = ({target_length_px, w0, h0}: {
    target_length_px: number,
    w0: number,
    h0: number,
  }) => {
    //リサイズの必要がなければ元のwidth, heightを返す
    var length = Math.max(w0, h0);
    if(length <= target_length_px){
      return{
        flag: false,
        w: w0,
        h: h0
      };
    }
    //リサイズの計算
    var w1;
    var h1;
    if(w0 >= h0){
      w1 = target_length_px;
      h1 = h0 * target_length_px / w0;
    }else{
      w1 = w0 * target_length_px / h0;
      h1 = target_length_px;
    }
    return {
      flag: true,
      w: w1,
      h: h1
    };
  }

  const renderImage = (imageUrl: string) => {
    if (canvas) {
      fabric.Image.fromURL(imageUrl, (img) => {
        img.scaleToWidth(canvas.width || 150);
        canvas.setBackgroundImage(img, () => canvas.renderAll())
      });
    }
  };

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
    }
  };

  const toggleDrawingMode = () => {
    if (canvas) {
      canvas.isDrawingMode = !canvas.isDrawingMode;
    }
  };

  const addText = (text: string) => {
    if (canvas) {
      const textObject = new fabric.IText(text, {
        originX: 'center',
        originY: 'center',
        fill: 'red',
      });
      canvas.add(textObject);
      textObject.center();
    }
  };

  const clickDrawArrowHandler = () => {
    if (canvas) {
      const triangle = new fabric.Triangle({
        width: 10,
        height: 15,
        fill: 'red',
        left: 135,
        top: 65,
        angle: 90,
      });

      const line = new fabric.Line([50, 100, 100, 100], {
        left: 75,
        top: 69,
        strokeWidth: 3,
        stroke: 'red',
      });

      const arrow = new fabric.Group([line, triangle]);
      canvas.add(arrow);
      arrow.center();
    }
  }

  const clickDrawCircleHandler = () => {
    if (canvas) {
      const circle = new fabric.Circle({
        radius: 20,
        stroke: 'red',
        strokeWidth: 3,
        fill: "transparent",
        originX: 'center',
        originY: 'center',
      });
      canvas.add(circle);
      circle.center();
    }
  }

  const clickDrawCrossHandler = () => {
    if (canvas) {
      const line1 = new fabric.Line([0, 0, 50, 50], {
        originX: 'center',
        originY: 'center',
        strokeWidth: 3,
        stroke: 'red',
      });
      const line2 = new fabric.Line([0, 50, 50, 0], {
        originX: 'center',
        originY: 'center',
        strokeWidth: 3,
        stroke: 'red',
      });

      const cross = new fabric.Group([line1, line2]);
      canvas.add(cross);
      cross.center();
    }
  }

  return {
    canvas,
    clearCanvas,
    toggleDrawingMode,
    addText,
    clickDrawArrowHandler,
    clickDrawCircleHandler,
    clickDrawCrossHandler,
    renderImage
  };
};
