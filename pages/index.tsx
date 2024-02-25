import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

type Args = {
  file: File | null;
};

export const useGetImageUrl = ({ file }: Args) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!file) {
      return;
    }

    let reader: FileReader | null = new FileReader();
    reader.onloadend = () => {
      // base64のimageUrlを生成する。
      const base64 = reader && reader.result;
      if (base64 && typeof base64 === 'string') {
        setImageUrl(base64);
      }
    };
    reader.readAsDataURL(file);

    return () => {
      reader = null;
    };
  }, [file]);

  return {
    imageUrl,
  };
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [isTypingMode, setIsTypingMode] = useState<boolean>(false);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget?.files && e.currentTarget.files[0]) {
      setImageFile(null);
      const targetFile = e.currentTarget.files[0];
      setImageFile(targetFile);
    }
  };

  const { imageUrl } = useGetImageUrl({ file: imageFile });

  useEffect(() => {
    if (imageUrl) {
      const _canvas = new fabric.Canvas(canvasRef.current);

      _canvas.setBackgroundImage(imageUrl, (e: HTMLImageElement) => {
        _canvas.setDimensions({width: e.width, height: e.height})
        _canvas.renderAll()
      })

      setCanvas(_canvas);
    }
  }, [imageUrl])

  const clickDownloadImageHandler = () => {
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      console.log(dataUrl)
    }
  }

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
      console.log(imageUrl)
      canvas.setBackgroundImage(imageUrl, (e: HTMLImageElement) => {
        canvas.setDimensions({width: e.width, height: e.height})
        canvas.renderAll()
      })
    }
  }

  const clickToggleDrawingModeHandler = () => {
    setIsDrawingMode(!isDrawingMode);

    if (canvas) {
      canvas.isDrawingMode = !isDrawingMode;
    }
  }

  const clickToggleTypingModeHandler = () => {
    setIsTypingMode(!isTypingMode);
  }

  const onBlurTextareaHandler = () => {
    if (canvas && textareaRef.current) {
      const text = new fabric.IText(textareaRef.current.value, {
        originX: 'center',
        originY: 'center',
        fill: 'red',
      });
      canvas.add(text);
      text.center();
      setIsTypingMode(false);
    }
  }

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

  const clickDrawRectangleHandler = () => {
    if (canvas) {
      const rect = new fabric.Rect({
        stroke: 'red',
        strokeWidth: 3,
        fill: 'transparent',
        width: 50,
        height: 50,
        originX: 'center',
        originY: 'center',
      });
      canvas.add(rect);
      rect.center();
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

  return (
    <>
      <div>
        <label htmlFor="image">画像をアップロードする</label>
        <input
          ref={fileInputRef}
          name="image"
          id="image"
          type="file"
          accept="image/*"
          onChange={onChangeHandler}
        />
      </div>
      <p>
        imageUrl:
        {imageUrl && (
          <div style={{display: "inline-block", position: "relative"}} ref={canvasWrapperRef}>
            <canvas ref={canvasRef}></canvas>
            {isTypingMode && (
              <textarea
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  transformOrigin: "center",
                  textAlign: "center",
                  background: "transparent",
                  border: "none",
                  resize: "none",
                  outline: "none",
                  fontSize: "40px",
                  color: "red",
                  fontFamily: "Times New Roman",
                }}
                ref={textareaRef}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onBlur={() => onBlurTextareaHandler()}/>
            )}
            <button onClick={() => clearCanvas()} >クリア</button>
            <button onClick={() => clickDownloadImageHandler()} >保存</button>
            <button onClick={() => clickToggleDrawingModeHandler()} >手書きモード{isDrawingMode ? "無効" : "有効"}</button>
            <button onClick={() => clickToggleTypingModeHandler()} >テキストモード{isTypingMode ? "無効" : "有効"}</button>
            <button onClick={() => clickDrawArrowHandler()}>→</button>
            <button onClick={() => clickDrawCircleHandler()}>〇</button>
            <button onClick={() => clickDrawRectangleHandler()}>□</button>
            <button onClick={() => clickDrawCrossHandler()}>✖</button>
          </div>
        )}
      </p>
    </>
  );
}
