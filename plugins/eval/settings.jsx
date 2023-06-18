import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";
import ItemWithRemove from "../../helpers/ui/ItemWithRemove.jsx";
const Real = Array.from({ length: 50 }, (arr, i) => ({
	pfp: "https://github.com/meqativ.png",
	username: "meqativ",
	id: i,
}));

export default (props) => {
	useProxy(storage);
	const [users, setUsers] = React.useState(Real);

	const handleRemoveUser = (userId) => {
		setUsers(users.filter((u) => u.id !== userId));
	};

	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			<Forms.FormSection title={"List"} titleStyleType="no_border">
				{users.map((u) => {
					return <ItemWithRemove imageSource={{ uri: u.pfp }} onImagePress={() => console.log(`${u.id} onImagePress`)} onRemove={() => handleRemoveUser(u.id)} label={u.username} />;
				})}
			</Forms.FormSection>
		</ReactNative.ScrollView>
	);
};
