import React from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';

import type { AppPageView } from '../../hooks/useHashRouter';
import type { RecipeId } from '../../types';
import { RecipePage, type RecipePageProps } from '../RecipePage';
import { RecipesView } from '../RecipesView';
import { StudioPage, type StudioPageProps } from '../StudioPage';

const viewVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.98,
        filter: 'blur(4px)',
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            x: { type: 'spring' as const, stiffness: 260, damping: 26 },
            opacity: { duration: 0.3 },
            scale: { duration: 0.4 },
            filter: { duration: 0.4 },
        },
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? '50%' : '-50%',
        opacity: 0,
        scale: 0.98,
        filter: 'blur(4px)',
        transition: {
            x: { type: 'spring' as const, stiffness: 260, damping: 26 },
            opacity: { duration: 0.3 },
            scale: { duration: 0.4 },
            filter: { duration: 0.4 },
        },
    }),
};

interface StudioViewportProps {
    routeView: AppPageView;
    direction: number;
    activeRecipe: RecipeId | null;
    recipePageProps: Omit<RecipePageProps, 'activeRecipe'>;
    studioPageProps: StudioPageProps;
    onSelectRecipe: (recipeId: RecipeId) => void;
}

export const StudioViewport: React.FC<StudioViewportProps> = ({
    routeView,
    direction,
    activeRecipe,
    recipePageProps,
    studioPageProps,
    onSelectRecipe,
}) => {
    return (
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            {routeView === 'recipe' && activeRecipe ? (
                <motion.div
                    key={`recipe-${activeRecipe}`}
                    custom={direction}
                    variants={viewVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full overflow-hidden"
                >
                    <RecipePage activeRecipe={activeRecipe} {...recipePageProps} />
                </motion.div>
            ) : routeView === 'studio' ? (
                <motion.div
                    key="studio"
                    custom={direction}
                    variants={viewVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full flex flex-row overflow-hidden"
                >
                    <StudioPage {...studioPageProps} />
                </motion.div>
            ) : (
                <motion.div
                    key="recipes-list"
                    custom={direction}
                    variants={viewVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full overflow-hidden"
                >
                    <RecipesView onSelectRecipe={onSelectRecipe} />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
