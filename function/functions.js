const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    createButton(interaction, options) {
        const { user } = interaction;

        const id = options.id;
        const id_name = options.id_name;
        const label = options.label;
        const button_style = options.style;
        let emoji = options.emoji;

        if (id.includes("_")) {
            throw new TypeError("Geçersiz ID. '_' olmadan kullanın.");
        }

        if (id_name.includes("_")) {
            throw new TypeError("Geçersiz ID Name. '_' olmadan kullanın.");
        }

        if (!emoji) {
            emoji = null;
        }

        const button = new ButtonBuilder()
            .setCustomId(`${id_name}_${id}`)
            .setLabel(label)
            .setStyle(button_style);

        if (emoji) {
            button.setEmoji(emoji);
        }

        const row = new ActionRowBuilder().addComponents(button);

        return row;
    },

    deleteMessageButton(interaction, options) {
        const { user } = interaction;

        const label = options.label;
        const style = options.style;
        let emoji = options.emoji;

        if (!emoji) {
            emoji = null;
        }

        const button = new ButtonBuilder()
            .setCustomId(`clearMessageButton_${user.id}`)
            .setLabel(label)
            .setStyle(style);

        if (emoji) {
            button.setEmoji(emoji);
        }

        const row = new ActionRowBuilder().addComponents(button);

        return row;
    }
};
