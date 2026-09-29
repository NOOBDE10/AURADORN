import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Trash2 } from 'lucide-react';
import { isImageUploadConfigured, uploadImage } from '../../services/imageUpload';
import { ghostBtn, inputCls } from './adminUi';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  /** Allow more than one image (products) or exactly one (categories, hero) */
  multiple?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange, multiple = true }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    const list = multiple ? Array.from(files) : [files[0]];
    setUploading(list.length);
    const uploaded: string[] = [];
    for (const file of list) {
      try {
        uploaded.push(await uploadImage(file));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed.');
      }
      setUploading(n => n - 1);
    }
    if (uploaded.length) onChange(multiple ? [...images, ...uploaded] : uploaded);
    if (fileInput.current) fileInput.current.value = '';
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!/^https?:\/\/\S+$/.test(url)) {
      setError('Please paste a full image link starting with https://');
      return;
    }
    setError('');
    onChange(multiple ? [...images, url] : [url]);
    setUrlInput('');
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative w-24 group">
              <img src={src} alt="" className="w-24 h-24 object-cover rounded-xl border border-[#EAE3D8] bg-[#F3EFEA]" />
              {multiple && i === 0 && (
                <span className="absolute top-1 left-1 bg-[#1C1815] text-white text-[9px] px-1.5 py-0.5 rounded">MAIN</span>
              )}
              <div className="flex justify-between mt-1">
                {multiple ? (
                  <>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-stone-500 disabled:opacity-30 cursor-pointer" title="Move left">
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="p-1 text-stone-500 disabled:opacity-30 cursor-pointer" title="Move right">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : <span />}
                <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="p-1 text-rose-500 cursor-pointer" title="Remove photo">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading > 0 || !isImageUploadConfigured}
          className={ghostBtn}
          title={isImageUploadConfigured ? '' : 'Photo upload is not set up yet — see SETUP.md step 6'}
        >
          {uploading > 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4 text-[#C9A25D]" />}
          {uploading > 0 ? `Uploading ${uploading}…` : multiple ? 'Upload photos' : images.length ? 'Replace photo' : 'Upload photo'}
        </button>
        <div className="flex gap-2 flex-1 min-w-55">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="…or paste an image link"
            className={inputCls}
          />
          <button type="button" onClick={addUrl} className={ghostBtn} title="Add image link">
            <Link2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {!isImageUploadConfigured && (
        <p className="text-[10px] text-amber-700">Photo upload is not set up yet (SETUP.md step 6). You can paste image links meanwhile.</p>
      )}
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </div>
  );
};
