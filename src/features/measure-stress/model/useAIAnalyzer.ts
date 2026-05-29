import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { Camera, CameraView } from 'expo-camera';
import { Dimensions, Platform } from 'react-native';

// Higher-order component to add tensor support to Camera
const TensorCamera = cameraWithTensors(CameraView);

const { width, height } = Dimensions.get('window');

// ROI settings (Central circle)
const ROI_RADIUS = (width * 0.78) / 2;
const ROI_CENTER_X = width / 2;
const ROI_CENTER_Y = height / 2; // This might need adjustment based on layout

export const useAIAnalyzer = () => {
    const [isModelReady, setIsModelReady] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [isWithinROI, setIsWithinROI] = useState(false);
    const modelRef = useRef<blazeface.BlazeFaceModel | null>(null);
    const frameCountRef = useRef(0);

    // Initialize TF and Model
    useEffect(() => {
        const initTF = async () => {
            await tf.ready();
            const model = await blazeface.load();
            modelRef.current = model;
            setIsModelReady(true);
            console.log('[AI] Model loaded successfully');
        };
        initTF();
    }, []);

    const handleCameraStream = useCallback(async (images: IterableIterator<tf.Tensor3D>, updatePreview: any, gl: any) => {
        const loop = async () => {
            if (!modelRef.current) return;

            // Limit frame rate for performance (every 3 frames)
            frameCountRef.current++;
            if (frameCountRef.current % 3 !== 0) {
                const nextImageTensor = images.next().value;
                if (nextImageTensor) tf.dispose(nextImageTensor);
                requestAnimationFrame(loop);
                return;
            }

            const imageTensor = images.next().value;
            if (!imageTensor) return;

            try {
                // Get tensor dimensions
                const [tensorHeight, tensorWidth] = imageTensor.shape;

                // Run face detection
                const returnTensors = false;
                const predictions = await modelRef.current.estimateFaces(imageTensor, returnTensors);

                if (predictions.length > 0) {
                    setFaceDetected(true);
                    
                    const face = predictions[0] as any;
                    const { topLeft, bottomRight } = face;
                    
                    // Scale coordinates from tensor to screen
                    const scaleX = width / tensorWidth;
                    const scaleY = height / tensorHeight;

                    const faceCenterX = ((topLeft[0] + bottomRight[0]) / 2) * scaleX;
                    const faceCenterY = ((topLeft[1] + bottomRight[1]) / 2) * scaleY;
                    
                    // Basic distance check from center
                    const dist = Math.sqrt(
                        Math.pow(faceCenterX - ROI_CENTER_X, 2) + 
                        Math.pow(faceCenterY - ROI_CENTER_Y, 2)
                    );

                    // Allow a very generous tolerance (150% of radius)
                    const withinROI = dist < ROI_RADIUS * 1.5;
                    setIsWithinROI(withinROI);

                    console.log(`[AI] Face detected! Tensor shape: ${tensorWidth}x${tensorHeight}, Center: (${faceCenterX.toFixed(1)}, ${faceCenterY.toFixed(1)}), Dist from ROI center: ${dist.toFixed(1)}, withinROI: ${withinROI}`);
                } else {
                    setFaceDetected(false);
                    setIsWithinROI(false);
                }
            } catch (error) {
                console.error('[AI] Prediction error:', error);
            } finally {
                tf.dispose(imageTensor);
            }

            requestAnimationFrame(loop);
        };

        loop();
    }, []);

    return {
        isModelReady,
        faceDetected,
        isWithinROI,
        handleCameraStream,
        TensorCamera
    };
};
