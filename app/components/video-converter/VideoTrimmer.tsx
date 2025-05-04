"use client";

import React, { useEffect, useRef, useState } from "react";

export interface VideoTrimmerProps {
  videoUrl: string | null;
  onTrimChange: (startTime: number, endTime: number) => void;
  videoFile: File | null;
  disabled?: boolean;
}

interface ThumbnailData {
  url: string;
  time: number;
}

const VideoTrimmer: React.FC<VideoTrimmerProps> = ({
  videoUrl,
  onTrimChange,
  videoFile,
  disabled = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startHandleRef = useRef<HTMLDivElement>(null);
  const endHandleRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<"start" | "end" | "selection" | null>(null);
  const startOffsetRef = useRef<number>(0);

  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([]);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Generate thumbnails from the video
  useEffect(() => {
    if (!videoUrl || !videoRef.current || disabled) return;

    const video = videoRef.current;
    
    const handleMetadata = () => {
      setVideoDuration(video.duration);
      setEndTime(video.duration);
      onTrimChange(0, video.duration);
      
      generateThumbnails(video);
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, [videoUrl, disabled, onTrimChange]);

  // Update container width on resize
  useEffect(() => {
    if (!containerRef.current || disabled) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [disabled]);

  // Set up drag handlers
  useEffect(() => {
    if (disabled) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerLeft = containerRect.left;
      const containerRight = containerRect.right;
      const pixelsPerSecond = containerWidth / videoDuration;
      
      // Calculate position within the container
      let newPosition = (e.clientX - containerLeft) / pixelsPerSecond;
      
      // Clamp to container boundaries
      newPosition = Math.max(0, Math.min(newPosition, videoDuration));
      
      if (isDraggingRef.current === "start") {
        // Don't allow start to go past end - 1 second
        const newStartTime = Math.min(newPosition, endTime - 1);
        setStartTime(newStartTime);
        onTrimChange(newStartTime, endTime);
      } else if (isDraggingRef.current === "end") {
        // Don't allow end to go before start + 1 second
        const newEndTime = Math.max(newPosition, startTime + 1);
        setEndTime(newEndTime);
        onTrimChange(startTime, newEndTime);
      } else if (isDraggingRef.current === "selection") {
        // Move entire selection, keeping the same duration
        const duration = endTime - startTime;
        let offset = (e.clientX - startOffsetRef.current) / pixelsPerSecond;
        
        // Ensure we don't go beyond boundaries
        if (startTime + offset < 0) {
          offset = -startTime;
        } else if (endTime + offset > videoDuration) {
          offset = videoDuration - endTime;
        }
        
        const newStartTime = startTime + offset;
        const newEndTime = endTime + offset;
        
        setStartTime(newStartTime);
        setEndTime(newEndTime);
        onTrimChange(newStartTime, newEndTime);
        
        // Update the offset reference to prevent accumulation
        startOffsetRef.current = e.clientX;
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = null;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerWidth, startTime, endTime, videoDuration, onTrimChange, disabled]);

  // Generate thumbnails for the video
  const generateThumbnails = async (video: HTMLVideoElement) => {
    if (!video || video.duration === 0 || isLoading) return;
    
    setIsLoading(true);
    const duration = video.duration;
    
    // We'll generate 10 thumbnails across the video
    const numThumbnails = 10;
    const thumbnailInterval = duration / numThumbnails;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setIsLoading(false);
      return;
    }
    
    // Set canvas dimensions
    canvas.width = 160; // thumbnail width
    canvas.height = 90; // thumbnail height
    
    const newThumbnails: ThumbnailData[] = [];
    
    for (let i = 0; i < numThumbnails; i++) {
      const time = i * thumbnailInterval;
      
      // Set video to this timestamp
      video.currentTime = time;
      
      // Wait for the video to seek to the timestamp
      await new Promise<void>((resolve) => {
        const seeked = () => {
          video.removeEventListener('seeked', seeked);
          resolve();
        };
        video.addEventListener('seeked', seeked);
      });
      
      // Draw the current frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.5);
      
      newThumbnails.push({
        url: thumbnailUrl,
        time,
      });
    }
    
    setThumbnails(newThumbnails);
    setIsLoading(false);
  };

  // Format time (seconds) to MM:SS format
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle dragging start
  const handleStartHandleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    isDraggingRef.current = "start";
  };

  // Handle dragging end
  const handleEndHandleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    isDraggingRef.current = "end";
  };

  // Handle dragging the entire selection
  const handleSelectionMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    isDraggingRef.current = "selection";
    startOffsetRef.current = e.clientX;
  };

  // Calculate position based on time
  const getPositionFromTime = (time: number): number => {
    if (videoDuration === 0) return 0;
    return (time / videoDuration) * 100;
  };
  
  // Seek video to a specific time when clicking on thumbnails
  const handleThumbnailClick = (time: number) => {
    if (disabled) return;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div className="w-full">
      {/* Hidden video element for thumbnail generation */}
      <video 
        ref={videoRef} 
        src={videoUrl || undefined} 
        className="hidden" 
        preload="metadata"
      />
      
      {/* Trimmer UI */}
      <div className="flex flex-col gap-2 w-full">
        {/* Trim duration display */}
        <div className="flex justify-between text-sm">
          <span>
            Start: {formatTime(startTime)}
          </span>
          <span>
            Duration: {formatTime(endTime - startTime)}
          </span>
          <span>
            End: {formatTime(endTime)}
          </span>
        </div>
        
        {/* Thumbnails and trimmer container */}
        <div 
          ref={containerRef}
          className="relative h-16 bg-gray-800 w-full rounded-md overflow-hidden"
        >
          {/* Thumbnails */}
          <div className="absolute top-0 left-0 w-full h-full flex">
            {thumbnails.map((thumbnail, index) => (
              <div 
                key={index}
                className="h-full cursor-pointer"
                style={{ 
                  width: `${100 / thumbnails.length}%`,
                  backgroundImage: `url(${thumbnail.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onClick={() => handleThumbnailClick(thumbnail.time)}
              />
            ))}
            
            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <span className="text-white">Generating thumbnails...</span>
              </div>
            )}
          </div>
          
          {/* Selection overlay */}
          <div
            ref={selectionRef}
            className="absolute top-0 h-full bg-blue-500 bg-opacity-30 border-2 border-blue-500 cursor-move"
            style={{
              left: `${getPositionFromTime(startTime)}%`,
              width: `${getPositionFromTime(endTime) - getPositionFromTime(startTime)}%`
            }}
            onMouseDown={handleSelectionMouseDown}
          />
          
          {/* Start handle */}
          <div
            ref={startHandleRef}
            className="absolute top-0 h-full w-2 bg-blue-600 cursor-col-resize"
            style={{
              left: `${getPositionFromTime(startTime)}%`
            }}
            onMouseDown={handleStartHandleMouseDown}
          />
          
          {/* End handle */}
          <div
            ref={endHandleRef}
            className="absolute top-0 h-full w-2 bg-blue-600 cursor-col-resize"
            style={{
              left: `${getPositionFromTime(endTime)}%`
            }}
            onMouseDown={handleEndHandleMouseDown}
          />
          
          {/* Time markers */}
          <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-xs text-white">
            <span>0:00</span>
            <span>{formatTime(videoDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTrimmer;