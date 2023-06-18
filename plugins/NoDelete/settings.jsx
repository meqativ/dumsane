import { React, ReactNative, Profiles } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { Forms } from "@vendetta/ui/components";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { getTranslation } from "./translations.js";
import ItemWithRemove from "../../helpers/ui/ItemWithRemove.jsx";
import { findByStoreName, findByProps } from "@vendetta/metro";
let UserStore, UncachedUserManager;
async function openProfile(userId) {
	if (!UserStore || !UncachedUserManager) return false;
	const show = Profiles.showUserProfile;

	Users.getUser(userId) ? show({ userId }) : UncachedUserManager.getUser(userId).then(({ id }) => show({ id }));
}
export default (props) => {
	UserStore ??= findByStoreName("UserStore");
	UncachedUserManager ??= findByProps("fetchProfile", "getUser", "setFlag");

	useProxy(storage);
	const [users, setUsers] = React.useState(storage["ignore"]["users"]);

	const handleRemoveUser = (userId) => {
		const newArr = users.filter((id) => id !== userId);
		storage["ignore"].users = newArr;
		setUsers(newArr);
	};
	const handleClearUsers = () => {
		storage["ignore"].users = [];
		setUsers([]);
	};

	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			<Forms.FormSection title={getTranslation("settings.titles.settings")} titleStyleType="no_border">
				<Forms.FormRow label={getTranslation("settings.showTimestamps")} trailing={<Forms.FormSwitch value={storage.timestamps} onValueChange={(v) => (storage.timestamps = v)} />} />
				<Forms.FormRow label={getTranslation("settings.ewTimestampFormat")} trailing={<Forms.FormSwitch value={storage["ew"]} onValueChange={(v) => (storage.ew = v)} />} />
				<Forms.FormDivider />
				<Forms.FormRow label={getTranslation("settings.youDeletedItWarning")} />
			</Forms.FormSection>
			<Forms.FormSection title={getTranslation("settings.titles.filters")}>
				<Forms.FormRow label={getTranslation("settings.ignoreBots")} trailing={<Forms.FormSwitch value={storage["ignore"].bots} onValueChange={(value) => (storage["ignore"].bots = value)} />} />
				<Forms.FormRow
					label={getTranslation("settings.clearUsersLabel", true)?.make?.(users.length)}
					trailing={<Forms.FormRow.Icon source={getAssetIDByName("ic_trash_24px")} />}
					onPress={() => {
						if (users.length !== 0)
							showConfirmationAlert({
								title: getTranslation("settings.confirmClear.title"),
								content: getTranslation("settings.confirmClear.description", true)?.make?.(users.length),
								confirmText: getTranslation("settings.confirmClear.yes"),
								cancelText: getTranslation("settings.confirmClear.no"),
								confirmColor: "brand",
								onConfirm: handleClearUsers,
							});
					}}
				/>
				<ReactNative.ScrollView style={{ flex: 1, marginLeft: 15 }}>
					{
						((uncached = 0),
						users.map((id) => {
							const User = UserStore.getUser(id) ?? {};
							let pfp = User?.getAvatarURL?.()?.replace?.(/\.(gif|webp)/, ".png");
							if (!pfp) {
								pfp = "https://cdn.discordapp.com/embed/avatars/1.png";
								User.username = `Uncached (${id})`;
								User.discriminator = "0";
								if (uncached === 0) User.username += " Press the avatar to open their profile";
								uncached++;
							}

							return (
								<ItemWithRemove
									imageSource={{ uri: pfp }}
									onImagePress={() => {
										openProfile(id);
									}}
									onRemove={() => handleRemoveUser(id)}
									label={User.username + (User.discriminator == 0 ? "" : `#${User.discriminator}`)}
									labelRemove={getTranslation("settings.removeUserButton")}
								/>
							);
						}))
					}
				</ReactNative.ScrollView>
				<Forms.FormDivider />
				<Forms.FormRow label={getTranslation("settings.addUsersInfo")} />
			</Forms.FormSection>
		</ReactNative.ScrollView>
	);
};
