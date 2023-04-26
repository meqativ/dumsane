const { React, ReactNative } = vendetta.metro.common;
const {
  plugin: { storage },
  storage: { useProxy },
  ui: {
    components: { Forms },
  },
} = vendetta;
const { FormRow, FormSection, FormSwitch } = Forms;

const Button = vendetta.metro.findByProps(
  "ButtonColors",
  "ButtonLooks",
  "ButtonSizes"
).default;

export default (
  props,
  { patches, reloadUwuifier, startMessageTransfoworming }
) => {
  useProxy(storage);
  return (
    <ReactNative.ScrollView style={{ flex: 1 }}>
      {[
        { label: "faces", default: true, id: "cfg.spaces.faces" },
        { label: "actions", default: true, id: "cfg.spaces.actions" },
        { label: "stutters", default: true, id: "cfg.spaces.stutters" },
        { label: "words", default: true, id: "cfg.words" },
        { label: "exclamations", default: false, id: "cfg.exclamations" },
        {
          label: "Strength sliders will come when i figure out how to make em",
        },
        {
          id: "reload",
          style: { height: 5, margin: 8 },
          name: "Reload uwuifier",
          onPress: () => {
            reloadUwuifier(storage);
            vendetta.ui.toasts.showToast(
              `Reloaded uwuifier`,
              vendetta.ui.assets.getAssetIDByName("check")
            );
          },
        },
        /*{ label: "Uwuify messages", default: false, id: "uwuify_messages", onValueChange: (val) => { 
				if (val===false) {
					let p = patches?.[1];
					if (p) {
						p();
						patches.splice(1, 1)
					}
				} else {
					this.startMessageTransfoworming(storage);
				}
				}
			}//*/
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
                    cfg?.onValueChange?.(value);
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
