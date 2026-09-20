import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { Forms } from "@vendetta/ui/components";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import ItemWithRemove from "../../common/ui/ItemWithRemove.jsx";
import { findByStoreName, findByProps } from "@vendetta/metro";
import { ScrollView, Stack, TableRowGroup, TableSwitchRow, TableRow, TextInput } from "../../common/ui/TableComponents.js";

const { View, Text } = ReactNative;
const { Card } = findByProps("Card") || {};
const { openAlert, dismissAlert } = findByProps("openAlert", "dismissAlert") || {};
const { AlertModal, AlertActionButton } = findByProps("AlertModal", "AlertActions") || {};

let UserStore, UncachedUserManager, Profiles;

export default () => {
	UserStore ??= findByStoreName("UserStore");
	UncachedUserManager ??= findByProps("fetchProfile", "getUser", "setFlag");
	Profiles ??= findByProps("showUserProfile");

	async function openProfile(userId) {
		const show = Profiles.showUserProfile;
		UserStore.getUser(userId) ? show({ userId }) : UncachedUserManager.getUser(userId).then(({ id }) => show({ userId: id }));
	}

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

	const AddUserModal = () => {
		const [input, setInput] = React.useState("");
		const _description = `Enter the Discord ID of the user you want to ignore.\nTo get the id:\nFirst, go to Discord Settings → Advanced → Turn on "Developer Mode"\nOpen the profile of the user you wanna block, press the three dots at the top right and then press "Copy User ID"`
		return (
			<AlertModal
				title="Add User by ID"
				content={_description}
				extraContent={
					<TextInput
						placeholder="User ID"
						value={input}
						onChange={setInput}
						keyboardType="numeric"
						autoFocus={true}
					/>
				}
				actions={
					<Stack>
						<AlertActionButton
							text="Add"
							variant="primary"
							disabled={!input.trim() || !/^\d+$/.test(input.trim())}
							onPress={() => {
								const trimmed = input.trim();
								if (!/^\d+$/.test(trimmed)) {
									showToast("Invalid user ID", getAssetIDByName("XSmallIcon"));
									return;
								}
								if (storage["ignore"]["users"].includes(trimmed)) {
									showToast("User already ignored", getAssetIDByName("WarningIcon"));
									dismissAlert("nodelete-add-user");
									return;
								}
								storage["ignore"]["users"].push(trimmed);
								setUsers([...storage["ignore"]["users"]]);
								showToast("Added user to ignore list", getAssetIDByName("CheckmarkSmallIcon"));
								dismissAlert("nodelete-add-user");
							}}
						/>
						<AlertActionButton
							text="Cancel"
							variant="secondary"
							onPress={() => dismissAlert("nodelete-add-user")}
						/>
					</Stack>
				}
			/>
		);
	};

	const handleAddUserById = () => {
		if (openAlert && AlertModal) {
			openAlert("nodelete-add-user", <AddUserModal />);
		} else {
			showToast("Alert component unavailable", getAssetIDByName("XSmallIcon"));
		}
	};

	let uncached = 0;

	const cardContent = (
		<View style={{ padding: 12, gap: 10 }}>
			<Text variant="heading-md/semibold" style={{ color: "#dbdee1" }}>
				{`You have ${users.length} user${users.length === 1 ? "" : "s"} in the ignored users list`}
			</Text>
			{users.length > 0 && (
				<View style={{ gap: 6, marginTop: 4 }}>
					{users.map((id) => {
						const User = UserStore.getUser(id) ?? {};
						let pfp = User?.getAvatarURL?.(null, 26)?.replace?.(/\.(gif|webp)/, ".png");
						if (!pfp) {
							pfp = "https://cdn.discordapp.com/embed/avatars/1.png?size=48";
							User.username = `${id} Uncached`;
							User.discriminator = "0";
							if (uncached === 0) User.username += ", press the avatar";
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
								labelRemove="REMOVE"
							/>
						);
					})}
				</View>
			)}
		</View>
	);

	return (
		<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
			<Stack spacing={12}>
				<TableRowGroup title="Display">
					<TableSwitchRow
						label="Show the time of deletion"
						value={storage.timestamps}
						onValueChange={(v) => (storage.timestamps = v)}
					/>
					<TableSwitchRow
						label="Use 12-hour format"
						value={storage["ew"]}
						onValueChange={(v) => (storage["ew"] = v)}
					/>
				</TableRowGroup>

				<TableRowGroup title="Filters">
					<TableSwitchRow
						label="Ignore bots"
						value={storage["ignore"].bots}
						onValueChange={(value) => (storage["ignore"].bots = value)}
					/>
					<TableRow
						label="Add user by ID"
						subLabel="Ignore a user manually via their ID"
						trailing={<TableRow.Arrow />}
						onPress={handleAddUserById}
					/>
					<TableRow
						variant="danger"
						label="Clear ignored users"
						onPress={() => {
							if (users.length !== 0)
								showConfirmationAlert({
									title: "Hold on!",
									content: `This will remove ${users.length} user${users.length === 1 ? "" : "s"} from the ignored users list.\nDo you really want to do that?`,
									confirmText: "Yes",
									cancelText: "Cancel",
									confirmColor: "red",
									onConfirm: handleClearUsers,
								});
						}}
					/>
				</TableRowGroup>

				<Stack spacing={8}>
					{Card ? <Card>{cardContent}</Card> : <View style={{ backgroundColor: "#2b2d31", borderRadius: 16, overflow: "hidden" }}>{cardContent}</View>}
				</Stack>
			</Stack>
		</ScrollView>
	);
};
