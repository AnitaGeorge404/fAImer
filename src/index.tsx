import React, { useState } from 'react';
import HomeScreen from '../components/screens/HomeScreen';
import UnifiedScanScreen from '../components/screens/UnifiedScanScreen';

const Index: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState('home');

    const handleFeatureClick = (featureId: string) => {
        if (featureId === 'scanner') {
            setActiveScreen('scanner');
        }
        // Handle other feature clicks here if needed
        console.log(`Feature clicked: ${featureId}`);
    };

    const handleBack = () => {
        setActiveScreen('home');
    };

    switch (activeScreen) {
        case 'scanner':
            return <UnifiedScanScreen onBack={handleBack} />;
        case 'home':
        default:
            return <HomeScreen onFeatureClick={handleFeatureClick} />;
    }
};

export default Index;
