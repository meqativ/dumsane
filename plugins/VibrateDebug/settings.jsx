const { React, ReactNative } = vendetta.metro.common;
const {
  plugin: { storage },
  storage: { useProxy },
} = vendetta;
if (!("test" in storage)) storage["test"] = "";

export default (props) => {
  useProxy(storage);
  return (
    <ReactNative.ScrollView style={{ flex: 1 }}>
      <ReactNative.Button
        title="hey"
        onPress={(h) => console.log("pressed", h)}
        accessibilityLabel="test button"
      />
      <ReactNative.TextInput
        onChangeText={(v) => (storage["test"] = v)}
        value={""}
        placeholder="useless placeholder"
        keyboardType="numeric"
        multiline={true}
      />
    </ReactNative.ScrollView>
  );
};
