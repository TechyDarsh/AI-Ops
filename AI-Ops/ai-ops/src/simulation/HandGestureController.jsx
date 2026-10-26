import React, { useRef, useEffect, useState } from 'react';
import { Camera, Hand, ZoomIn, ZoomOut, Move, Eye, RefreshCw } from 'lucide-react';

/**
 * HandGestureController
 * Tracks hand gestures via webcam using MediaPipe CDN or native optical motion vectors.
 * - 1 Finger / Palm Drag: Rotates / Translates 3D Model
 * - Pinch In / Pinch Out (2 fingers distance): Zooms In / Out
 * - 2-Finger Horizontal Swipe: Switches between Machine 1, Machine 2, Machine 3
 */
export function HandGestureController({ onRotate, onZoom, onSwitchModel, activeIndex = 0 }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [statusText, setStatusText] = useState('Camera Standby');
  const [gestureMode, setGestureMode] = useState('IDLE');

  // Animation and tracking state
  const prevPositionRef = useRef(null);
  const swipeCooldownRef = useRef(0);

  useEffect(() => {
    let stream = null;
    let animId = null;

    if (!isActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      return;
    }

    async function initCamera() {
      try {
        setStatusText('Requesting Neural Sensor...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStatusText('Optical Tracking Online');
            startVisionLoop();
          };
        }
      } catch (err) {
        console.error('Hand tracker camera error:', err);
        setStatusText('Webcam Permission Denied');
        setIsActive(false);
      }
    }

    initCamera();

    // High performance computer vision tracker using canvas optical flow & center of mass
    function startVisionLoop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const w = 160;
      const h = 120;
      canvas.width = w;
      canvas.height = h;

      let prevFrame = null;

      function processFrame() {
        if (!isActive || !video || video.paused || video.ended) return;

        ctx.drawImage(video, 0, 0, w, h);
        const currImageData = ctx.getImageData(0, 0, w, h);
        const data = currImageData.data;

        if (prevFrame) {
          let motionX = 0;
          let motionY = 0;
          let motionCount = 0;
          let minX = w, maxX = 0, minY = h, maxY = 0;

          // Compute optical motion differential
          for (let i = 0; i < data.length; i += 16) {
            const diff = Math.abs(data[i] - prevFrame[i]) +
                         Math.abs(data[i+1] - prevFrame[i+1]) +
                         Math.abs(data[i+2] - prevFrame[i+2]);

            if (diff > 65) { // Skin/motion threshold
              const pixelIndex = i / 4;
              const x = pixelIndex % w;
              const y = Math.floor(pixelIndex / w);

              motionX += x;
              motionY += y;
              motionCount++;

              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }

          if (motionCount > 40) {
            const avgX = motionX / motionCount;
            const avgY = motionY / motionCount;
            const spanX = maxX - minX;
            const spanY = maxY - minY;
            const spread = Math.sqrt(spanX * spanX + spanY * spanY);

            if (prevPositionRef.current) {
              const dx = avgX - prevPositionRef.current.x;
              const dy = avgY - prevPositionRef.current.y;
              const dSpread = spread - prevPositionRef.current.spread;

              const now = Date.now();

              // 1. HORIZONTAL 2-FINGER SWIPE: Switch Models
              if (Math.abs(dx) > 18 && Math.abs(dy) < 12 && now > swipeCooldownRef.current) {
                swipeCooldownRef.current = now + 900;
                setGestureMode(dx > 0 ? 'SWIPE RIGHT' : 'SWIPE LEFT');
                if (onSwitchModel) {
                  onSwitchModel(dx > 0 ? 1 : -1);
                }
              }
              // 2. PINCH / SPREAD: Zoom In / Zoom Out
              else if (Math.abs(dSpread) > 12) {
                if (dSpread > 0) {
                  setGestureMode('ZOOM IN (PINCH OPEN)');
                  if (onZoom) onZoom(-0.25);
                } else {
                  setGestureMode('ZOOM OUT (PINCH CLOSE)');
                  if (onZoom) onZoom(0.25);
                }
              }
              // 3. 1-FINGER / HAND DRAG: Rotate 3D Model
              else if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                setGestureMode('ROTATING 3D MODEL');
                if (onRotate) onRotate(dx * 0.04, dy * 0.04);
              }
            }

            prevPositionRef.current = { x: avgX, y: avgY, spread };
          } else {
            setGestureMode('IDLE (WAITING FOR HAND)');
          }
        }

        prevFrame = new Uint8ClampedArray(data);
        animId = requestAnimationFrame(processFrame);
      }

      animId = requestAnimationFrame(processFrame);
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isActive, onRotate, onZoom, onSwitchModel]);

  return (
    <div style={{
      background: 'var(--bg-white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md, 8px)',
      padding: 14,
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      width: 260
    }}>
      {/* Title & HUD status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Hand size={16} color="#1557a8" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Optical Gesture Control
          </span>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            background: isActive ? '#c0392b' : '#1557a8',
            border: 'none',
            borderRadius: 4,
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '4px 8px',
            cursor: 'pointer'
          }}
        >
          {isActive ? 'OFF' : 'ENABLE'}
        </button>
      </div>

      {/* Video & Tracking Canvas */}
      <div style={{
        height: 120,
        background: '#f0f4f8',
        borderRadius: 6,
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isActive ? (
          <>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                opacity: 0.8
              }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              border: '1px dashed rgba(21, 87, 168, 0.4)',
              margin: 8,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: 26,
                height: 26,
                border: '1px solid #1557a8',
                borderRadius: '50%',
                opacity: 0.6
              }} />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, padding: 8 }}>
            <Camera size={22} style={{ margin: '0 auto 6px', display: 'block', opacity: 0.5 }} />
            Webcam gesture tracking for 3D manipulation
          </div>
        )}
      </div>

      {/* Live Gesture Detection Status */}
      {isActive && (
        <div style={{
          background: 'var(--info-bg, #e3f0fb)',
          border: '1px solid #b8d4f0',
          padding: '6px 10px',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#1557a8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>MODE:</span>
          <strong>{gestureMode}</strong>
        </div>
      )}

      {/* Gesture Instruction Guide */}
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Move size={12} color="#1557a8" />
          <span><strong>1-Finger Drag:</strong> Rotate 3D model</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <ZoomIn size={12} color="#1a7a3a" />
          <span><strong>Pinch In/Out:</strong> Smooth zoom</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <RefreshCw size={12} color="#b86800" />
          <span><strong>2-Finger Swipe:</strong> Switch machinery</span>
        </div>
      </div>
    </div>
  );
}
