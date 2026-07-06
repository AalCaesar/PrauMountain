'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { uploadBasecampPhoto } from '../actions';

interface PhotoUploaderProps {
  basecampId: string;
  currentPhoto: string | null;
  basecampName: string;
}

export default function PhotoUploader({ basecampId, currentPhoto, basecampName }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG, PNG, dll)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadBasecampPhoto(basecampId, file);

      if (result.success && result.url) {
        setPreview(result.url);
        URL.revokeObjectURL(objectUrl);
      } else {
        setUploadError(result.error || 'Gagal mengunggah foto');
        setPreview(currentPhoto);
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadError('Terjadi kesalahan saat mengunggah foto');
      setPreview(currentPhoto);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePreview = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(currentPhoto);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Foto Basecamp
          </h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Upload foto untuk menarik minat pendaki
        </p>
      </div>

      <div className="p-6 space-y-4">
        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {uploadError}
          </div>
        )}

        {preview ? (
          <div className="relative">
            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt={basecampName}
                fill
                className="object-cover"
                unoptimized={preview.startsWith('blob:')}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
                    <p className="text-white text-sm">Mengunggah foto...</p>
                  </div>
                </div>
              )}
            </div>

            {!isUploading && (
              <button
                onClick={handleRemovePreview}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Hapus preview"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
              relative w-full aspect-video border-2 border-dashed rounded-lg
              flex flex-col items-center justify-center cursor-pointer
              transition-colors
              ${isDragging
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }
            `}
          >
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Klik untuk upload atau drag & drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, atau GIF (max. 5MB)
            </p>

            {isUploading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-2" />
                  <p className="text-emerald-700 text-sm">Mengunggah foto...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          disabled={isUploading}
          className="hidden"
        />

        <button
          onClick={handleClick}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengunggah...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {preview ? 'Ganti Foto' : 'Upload Foto'}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Foto akan langsung tersimpan setelah upload berhasil
        </p>
      </div>
    </div>
  );
}
