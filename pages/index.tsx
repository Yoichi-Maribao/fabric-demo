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

const resizeWidthHeight = ({target_length_px, w0, h0}: {
  target_length_px: number,
  w0: number,
  h0: number,
}) => {
  //リサイズの必要がなければ元のwidth, heightを返す
  const length = Math.max(w0, h0);
  if(length <= target_length_px){
    return{
      flag: false,
      w: w0,
      h: h0
    };
  }
  //リサイズの計算
  let w1;
  let h1;
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

const renderCanvas = ({imageUrl, canvas, isMobile}: {imageUrl: string, canvas: fabric.Canvas, isMobile: boolean}) => {
  fabric.Image.fromURL(imageUrl, (e) => {
  if (e.width && e.height && canvas.width) {
    if (isMobile) {
      // モバイルの時はキャンバスに画像を合わせる
      // const { w } = resizeWidthHeight({target_length_px: 1024, w0: e.width, h0: e.height})
      e.scaleToWidth(canvas.width);
      // e.scaleToHeight(h);
      canvas.setBackgroundImage(e, () => canvas.renderAll())
    } else {
      // PCの時は画像にキャンバスの幅に合わせる
      fabric.Image.fromURL(imageUrl, (img) => {
        if (!img.width || !img.height) return;
        canvas.setDimensions({width: img.width, height: img.height});
        canvas.setBackgroundImage(img, () => canvas.renderAll(), {
          
        })
      });
    }
  }
})}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [isTypingMode, setIsTypingMode] = useState<boolean>(false);
  const [ua, setUa] = useState<{
    Mobile: {
      0: boolean,
      iPhone: boolean,
      Android: boolean,
    },
    Tablet: boolean,
    PC: boolean
  
  }>({
    Mobile: {
      0: false,
      iPhone: false,
      Android: false,
    },
    Tablet: false,
    PC: false
  });
  

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget?.files && e.currentTarget.files[0]) {
      setImageFile(null);
      const targetFile = e.currentTarget.files[0];
      setImageFile(targetFile);
    }
  };

  const { imageUrl } = useGetImageUrl({ file: imageFile });

  useEffect(() => {
    const u = window.navigator.userAgent.toLowerCase();
    const mobile = {
          0: (u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
          || u.indexOf("iphone") != -1
          || u.indexOf("ipod") != -1
          || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
          || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
          || u.indexOf("blackberry") != -1,
          iPhone: (u.indexOf("iphone") != -1),
          Android: (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
    };
    const tablet = (u.indexOf("windows") != -1 && u.indexOf("touch") != -1)
          || u.indexOf("ipad") != -1
          || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1)
          || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1)
          || u.indexOf("kindle") != -1
          || u.indexOf("silk") != -1
          || u.indexOf("playbook") != -1;
    const pc = !mobile[0] && !tablet;
    setUa({
    Mobile: mobile,
    Tablet: tablet,
    PC: pc
    });
  }, [])

  useEffect(() => {
    if (imageUrl) {
      const _canvas = new fabric.Canvas(canvasRef.current);
      renderCanvas({imageUrl, canvas: _canvas, isMobile: ua.Mobile[0]});

      setCanvas(_canvas);
    }
  }, [imageUrl, ua.Mobile])

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
      renderCanvas({imageUrl, canvas, isMobile: ua.Mobile[0]})
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
      <div>
        imageUrl:
        {imageUrl && (
          <div style={{display: "inline-block", position: "relative"}}>
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
      </div>
    </>
  );
}
