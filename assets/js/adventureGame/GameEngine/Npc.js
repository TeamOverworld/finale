// Npc.js with DialogueSystem integration
import Character from "./Character.js";
import DialogueSystem from "../DialogueSystem.js";

class Npc extends Character {
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        this.interact = data?.interact; // Interact function
        this.currentQuestionIndex = 0;
        this.alertTimeout = null;
        this.isInteracting = false; // Flag to track if currently interacting
        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        this.handleKeyUpBound = this.handleKeyUp.bind(this);
        this.bindInteractKeyListeners();

        // IMPORTANT: Create a unique ID for each NPC to avoid conflicts
        this.uniqueId = data?.id + "_" + Math.random().toString(36).substr(2, 9);

        // Create a local dialogue system for this NPC
        if (data?.dialogues) {
            this.dialogueSystem = new DialogueSystem({
                dialogues: data.dialogues,
                id: this.uniqueId
            });
        } else {
            const greeting = data?.greeting || "Hello, traveler!";
            this.dialogueSystem = new DialogueSystem({
                dialogues: [
                    greeting,
                    "Nice weather we're having, isn't it?",
                    "I've been standing here for quite some time."
                ],
                id: this.uniqueId
            });
        }

        // Register with game control for cleanup during transitions
        if (gameEnv && gameEnv.gameControl) {
            gameEnv.gameControl.registerInteractionHandler(this);
        }
    }

    update() {
        this.draw();

        // Check if player is still in collision
        const players = this.gameEnv.gameObjects.filter(obj => {
            return obj.state?.collisionEvents?.includes(this.spriteData.id) || false;
        });

        // Reset interaction state if player moved away
        if (players.length === 0 && this.isInteracting) {
            this.isInteracting = false;
        }
    }

    bindInteractKeyListeners() {
        document.addEventListener('keydown', this.handleKeyDownBound);
        document.addEventListener('keyup', this.handleKeyUpBound);
    }

    removeInteractKeyListeners() {
        document.removeEventListener('keydown', this.handleKeyDownBound);
        document.removeEventListener('keyup', this.handleKeyUpBound);

        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
            this.alertTimeout = null;
        }

        if (this.dialogueSystem && this.dialogueSystem.isDialogueOpen()) {
            this.dialogueSystem.closeDialogue();
        }

        this.isInteracting = false;
    }

    handleKeyDown(event) {
        if (event.key === 'e' || event.key === 'u') {
            this.handleKeyInteract();
        }
    }

    handleKeyUp(event) {
        if (event.key === 'e' || event.key === 'u') {
            if (this.alertTimeout) {
                clearTimeout(this.alertTimeout);
                this.alertTimeout = null;
            }
        }
    }

    handleKeyInteract() {
        // Check if game is active - don't allow interactions during transitions
        if (this.gameEnv.gameControl && this.gameEnv.gameControl.isPaused) {
            return;
        }

        // If dialogue is open, close it
        if (this.dialogueSystem && this.dialogueSystem.isDialogueOpen()) {
            this.dialogueSystem.closeDialogue();
            return;
        }

        const players = this.gameEnv.gameObjects.filter(obj => {
            return obj.state?.collisionEvents?.includes(this.spriteData.id) || false;
        });

        const hasInteract = this.interact !== undefined;

        if (players.length > 0 && hasInteract && !this.isInteracting) {
            this.isInteracting = true;

            const originalInteract = this.interact;
            originalInteract.call(this);

            // Reset interaction state after short delay if still in the same level
            if (this.gameEnv && this.gameEnv.gameControl && !this.gameEnv.gameControl.isPaused) {
                setTimeout(() => {
                    this.isInteracting = false;
                }, 500);
            }
        }
    }

    showReactionDialogue() {
        if (!this.dialogueSystem) return;

        const npcName = this.spriteData?.id || "";
        const npcAvatar = this.spriteData?.src || null;
        const greeting = this.spriteData?.greeting || "Hello!";

        this.dialogueSystem.showDialogue(greeting, npcName, npcAvatar);
    }

    showRandomDialogue() {
        if (!this.dialogueSystem) return;

        const npcName = this.spriteData?.id || "";
        const npcAvatar = this.spriteData?.src || null;

        this.dialogueSystem.showRandomDialogue(npcName, npcAvatar);
    }

    destroy() {
        if (this.gameEnv && this.gameEnv.gameControl) {
            this.gameEnv.gameControl.unregisterInteractionHandler(this);
        }

        this.removeInteractKeyListeners();
        super.destroy();
    }
}

export default Npc;
