import { reloadUwuifier } from "./uwuifier";
const { ReactNative } = vendetta.metro.common;
const {
  plugin: { storage },
  storage: { useProxy },
  ui: {
    components: { Forms },
  },
} = vendetta;
const { FormRow, FormSwitch } = Forms;

const Button = vendetta.metro.findByProps(
  "ButtonColors",
  "ButtonLooks",
  "ButtonSizes"
).default;

export default function Settings() {
  useProxy(storage);
  return (
    <ReactNative.ScrollView style={{ flex: 1 }}>
      {[
        { label: "Add faces", default: true, id: "cfg.spaces.faces" },
        { label: "Add actions", default: true, id: "cfg.spaces.actions" },
        { label: "Add stutters", default: true, id: "cfg.spaces.stutters" },
        { label: "Add words", default: true, id: "cfg.words" },
        { label: "Add exclamations", default: false, id: "cfg.exclamations" },
        {
          id: "reload",
          style: { height: 5, margin: 8 },
          name: "Reload uwuifier (press this after toggling options above)",
          onPress: () => {
            reloadUwuifier(storage);
            vendetta.ui.toasts.showToast(
              `Reloaded uwuifier`,
              vendetta.ui.assets.getAssetIDByName("check")
            );
          },
        },
        { label: "Convert message before sending", default: true, id: "cfg.convert_messages" }
      ].map((config) => {
        if (config?.id === "reload") {
          return (
            <Button
              style={config.style}
              text={config.name ?? "Unnamed"}
              color="brand"
              size="small"
              disabled={false}
              onPress={config.onPress ?? (() => {})}
            />
          );
        }
        if ("id" in config && !(config.id in storage))
          storage[config.id] = config.default;
        return (
          <FormRow
            label={config?.label ?? config?.id ?? "no name"}
            trailing={
              "id" in config ? (
                <FormSwitch
                  value={storage[config.id] ?? config.default}
                  onValueChange={(value) => {
storage[config.id] = value;
                    config?.onValueChange?.(value);
                  }}
                />
              ) : undefined
            }
          />
        );
      })}
    </ReactNative.ScrollView>
  );
};
